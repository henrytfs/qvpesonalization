import { designAssets } from "@/data/assets";
import { fonts } from "@/data/fonts";
import { palettes } from "@/data/palettes";
import { products } from "@/data/products";
import { templates } from "@/data/templates";
import type { ColorPalette, DesignAsset, FontOption, Product, Template } from "@/lib/types";
import { createSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin-client";
import { applyTemplateAdjustments } from "@/lib/store/templateAdjustmentRepository";
import { listImportedProducts, listImportedTemplates } from "@/lib/store/importedCatalogRepository";

function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    productType: row.product_type as Product["productType"],
    mockupImageUrl: String(row.mockup_image_url ?? ""),
    defaultTemplateId: String(row.default_template_id ?? ""),
  };
}

function mapTemplateRow(row: Record<string, unknown>): Template {
  return row.config as Template;
}

function mapPaletteRow(row: Record<string, unknown>): ColorPalette {
  return {
    id: String(row.id),
    name: String(row.name),
    productTypes: row.product_types as ColorPalette["productTypes"],
    tokens: row.tokens as ColorPalette["tokens"],
    productionNotes: row.production_notes ? [String(row.production_notes)] : undefined,
  };
}

function mapFontRow(row: Record<string, unknown>): FontOption {
  return {
    id: String(row.id),
    name: String(row.name),
    cssFamily: String(row.css_family),
    category: row.category as FontOption["category"],
    supportsVietnamese: Boolean(row.supports_vietnamese),
    recommendedFor: row.recommended_for as FontOption["recommendedFor"],
    isScript: Boolean(row.is_script),
  };
}

function mapAssetRow(row: Record<string, unknown>): DesignAsset {
  return {
    id: String(row.id),
    name: String(row.name),
    category: row.category as DesignAsset["category"],
    svg: String(row.svg),
    allowedProductTypes: row.allowed_product_types as DesignAsset["allowedProductTypes"],
    colorEditable: Boolean(row.color_editable),
    defaultColorToken: row.default_color_token as DesignAsset["defaultColorToken"],
    productionSafe: Boolean(row.production_safe),
  };
}

async function trySupabase<T>(loader: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  if (!hasSupabaseAdminEnv()) return fallback;
  try {
    const data = await loader();
    return data.length > 0 ? data : fallback;
  } catch {
    return fallback;
  }
}

export async function listProducts(): Promise<Product[]> {
  const loaded = await trySupabase(async () => {
    const { data, error } = await createSupabaseAdminClient().from("products").select("*").eq("is_active", true).order("created_at");
    if (error) throw error;
    return (data ?? []).map(mapProductRow);
  }, products);
  const imported = await listImportedProducts();
  return [...imported, ...loaded.filter((product) => !imported.some((item) => item.sku === product.sku))];
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  return (await listProducts()).find((product) => product.sku === sku);
}

export async function listTemplates(sku?: string): Promise<Template[]> {
  const loaded = await trySupabase(async () => {
    let query = createSupabaseAdminClient().from("templates").select("*").eq("is_active", true).order("created_at");
    if (sku) query = query.eq("sku", sku);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapTemplateRow);
  }, sku ? templates.filter((template) => template.sku === sku) : templates);
  const imported = (await listImportedTemplates()).filter((template) => !sku || template.sku === sku);
  return applyTemplateAdjustments([...imported, ...loaded.filter((template) => !imported.some((item) => item.sku === template.sku || item.id === template.id))]);
}

export async function getTemplateById(id: string): Promise<Template | undefined> {
  return (await listTemplates()).find((template) => template.id === id);
}

export async function listPalettes(): Promise<ColorPalette[]> {
  return trySupabase(async () => {
    const { data, error } = await createSupabaseAdminClient().from("color_palettes").select("*").eq("is_active", true);
    if (error) throw error;
    return (data ?? []).map(mapPaletteRow);
  }, palettes);
}

export async function listFonts(): Promise<FontOption[]> {
  return trySupabase(async () => {
    const { data, error } = await createSupabaseAdminClient().from("font_options").select("*").eq("is_active", true);
    if (error) throw error;
    return (data ?? []).map(mapFontRow);
  }, fonts);
}

export async function listDesignAssets(): Promise<DesignAsset[]> {
  return trySupabase(async () => {
    const { data, error } = await createSupabaseAdminClient().from("design_assets").select("*").eq("is_active", true);
    if (error) throw error;
    return (data ?? []).map(mapAssetRow);
  }, designAssets);
}
