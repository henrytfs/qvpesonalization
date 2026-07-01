import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { ProductType, TemplateAdjustment } from "@/lib/types";
import { upsertImportedCatalog } from "@/lib/store/importedCatalogRepository";
import { saveTemplateAdjustment } from "@/lib/store/templateAdjustmentRepository";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function cleanSku(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-");
}

function cleanFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function isProductType(value: string): value is ProductType {
  return value === "plaque" || value === "award" || value === "medal" || value === "trophy";
}

function normalizeAdjustment(raw: Partial<TemplateAdjustment>, sku: string, templateId: string, mockupImageUrl: string): Omit<TemplateAdjustment, "version" | "updatedAt"> {
  if (!raw.surfaces?.length || !raw.fields?.length) {
    throw new Error("Template JSON must include at least one surface and one field.");
  }
  return {
    sku,
    templateId,
    mockupImageUrl,
    previewCanvas: raw.previewCanvas ?? { width: 1000, height: 1000 },
    surfaces: raw.surfaces,
    fields: raw.fields,
  };
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const sku = cleanSku(String(form.get("sku") ?? ""));
    const name = String(form.get("name") ?? "").trim();
    const productTypeValue = String(form.get("productType") ?? "");
    const image = form.get("image");
    const templateJson = form.get("templateJson");

    if (!sku || !name || !isProductType(productTypeValue)) {
      return NextResponse.json({ error: "SKU, product name, and product type are required." }, { status: 400 });
    }
    if (!(image instanceof File) || !(templateJson instanceof File)) {
      return NextResponse.json({ error: "Upload both a product image and Illustrator JSON file." }, { status: 400 });
    }

    const extension = imageExtensions[image.type];
    if (!extension) {
      return NextResponse.json({ error: "Product image must be JPG, PNG, or WebP." }, { status: 400 });
    }

    const imageFilename = `${cleanFilename(sku)}.${extension}`;
    const mockupImageUrl = `/products/${imageFilename}`;
    const imagePath = path.join(process.cwd(), "public", "products", imageFilename);
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, Buffer.from(await image.arrayBuffer()));

    const rawAdjustment = JSON.parse(await templateJson.text()) as Partial<TemplateAdjustment>;
    const templateId = String(rawAdjustment.templateId || `tpl-${cleanFilename(sku)}-imported`);
    const adjustmentInput = normalizeAdjustment(rawAdjustment, sku, templateId, mockupImageUrl);
    const adjustment = await saveTemplateAdjustment(adjustmentInput);
    const { product, template } = await upsertImportedCatalog({
      sku,
      name,
      productType: productTypeValue,
      mockupImageUrl,
      adjustment,
    });

    return NextResponse.json({
      product,
      template,
      adjustment,
      editorUrl: `/editor/${sku}`,
      files: {
        image: mockupImageUrl,
        adjustment: `data/template-adjustments/${sku}.json`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 400 });
  }
}
