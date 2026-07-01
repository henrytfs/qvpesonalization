import { NextRequest, NextResponse } from "next/server";
import { listDesignAssets, listFonts, listPalettes, listProducts, listTemplates } from "@/lib/store/catalogRepository";

export async function GET(request: NextRequest) {
  const sku = request.nextUrl.searchParams.get("sku") ?? undefined;
  const [products, templates, palettes, fonts, assets] = await Promise.all([
    listProducts(),
    listTemplates(sku),
    listPalettes(),
    listFonts(),
    listDesignAssets(),
  ]);
  return NextResponse.json({ products, templates, palettes, fonts, assets });
}
