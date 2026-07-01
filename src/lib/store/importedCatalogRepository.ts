import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductType, Template, TemplateAdjustment } from "@/lib/types";
import { importedProductsPath, importedTemplatesPath } from "@/lib/utils/filePaths";

interface ImportedCatalogInput {
  sku: string;
  name: string;
  productType: ProductType;
  mockupImageUrl: string;
  adjustment: TemplateAdjustment;
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), filePath), "utf8");
    return JSON.parse(file) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await fs.mkdir(path.dirname(path.join(process.cwd(), filePath)), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), filePath), JSON.stringify(data, null, 2));
}

function defaultPalettes(productType: ProductType) {
  if (productType === "trophy") return ["trophy-plate-basic"];
  if (productType === "award") return ["classic-gold", "corporate-blue", "red-ceremony"];
  return ["classic-gold", "black-gold", "corporate-blue", "red-ceremony"];
}

function defaultFonts(productType: ProductType) {
  if (productType === "trophy") return ["modern-sans", "bold-sans", "clean-vietnamese"];
  if (productType === "medal") return ["modern-sans", "bold-sans", "clean-vietnamese"];
  return ["formal-serif", "modern-sans", "elegant-serif", "clean-vietnamese", "script-placeholder"];
}

function templateFromImport(input: ImportedCatalogInput): Template {
  const allowedPaletteIds = defaultPalettes(input.productType);
  return {
    id: input.adjustment.templateId,
    sku: input.sku,
    name: `${input.name} Layout`,
    productType: input.productType,
    mockupImageUrl: input.mockupImageUrl,
    previewCanvas: input.adjustment.previewCanvas ?? { width: 1000, height: 1000 },
    surfaces: input.adjustment.surfaces ?? [],
    fields: input.adjustment.fields ?? [],
    defaultPaletteId: allowedPaletteIds[0],
    allowedPaletteIds,
    allowedFontIds: defaultFonts(input.productType),
    productionMethod: input.productType === "trophy" ? "metal_plate_engraving" : "uv_print_or_engraving_fill",
    productionNotes: ["Imported from Illustrator template JSON.", "Review Vietnamese diacritics and production method before manufacturing."],
  };
}

export async function listImportedProducts(): Promise<Product[]> {
  return readJsonFile<Product[]>(importedProductsPath, []);
}

export async function listImportedTemplates(): Promise<Template[]> {
  return readJsonFile<Template[]>(importedTemplatesPath, []);
}

export async function upsertImportedCatalog(input: ImportedCatalogInput): Promise<{ product: Product; template: Template }> {
  const product: Product = {
    id: `prod-${input.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    sku: input.sku,
    name: input.name,
    productType: input.productType,
    mockupImageUrl: input.mockupImageUrl,
    defaultTemplateId: input.adjustment.templateId,
  };
  const template = templateFromImport(input);
  const products = await listImportedProducts();
  const templates = await listImportedTemplates();
  const nextProducts = [product, ...products.filter((item) => item.sku !== input.sku)];
  const nextTemplates = [template, ...templates.filter((item) => item.id !== template.id && item.sku !== input.sku)];
  await Promise.all([writeJsonFile(importedProductsPath, nextProducts), writeJsonFile(importedTemplatesPath, nextTemplates)]);
  return { product, template };
}
