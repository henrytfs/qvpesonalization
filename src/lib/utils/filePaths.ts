export const localStorePath = "data/personalizations.json";
export const templateAdjustmentDir = "data/template-adjustments";

export function templateAdjustmentPath(sku: string): string {
  const safeSku = sku.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${templateAdjustmentDir}/${safeSku}.json`;
}

export function uploadLogoPath(personalizationId: string, extension: string): string {
  return `personalizations/${personalizationId}/logo-original.${extension}`;
}

export function renderOutputPath(personalizationId: string, extension: string): string {
  const filename = extension === "json" ? "layout.json" : `production.${extension}`;
  return `personalizations/${personalizationId}/${filename}`;
}
