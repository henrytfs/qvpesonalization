import { fonts } from "@/data/fonts";
import type { PersonalizationState, Template } from "@/lib/types";

export const allowedLogoMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"];
export const maxLogoUploadBytes = 15 * 1024 * 1024;

export function validatePersonalization(template: Template, state: PersonalizationState): string[] {
  const errors: string[] = [];
  if (state.sku !== template.sku) errors.push("Personalization SKU does not match selected template.");
  if (state.templateId !== template.id) errors.push("Invalid template selection.");
  if (!template.allowedPaletteIds.includes(state.paletteId)) errors.push("Selected palette is not allowed for this template.");

  for (const field of template.fields) {
    if (!field.editable || field.type === "image") continue;
    const value = (state.fieldValues[field.id] ?? field.defaultValue ?? "").trim();
    if (field.required && !value) errors.push(`${field.label} is required.`);
    if (field.maxLength && value.length > field.maxLength) errors.push(`${field.label} must be ${field.maxLength} characters or fewer.`);
    if (template.productType === "trophy" && value.length > 36) errors.push("Trophy base plate text should be short.");
    if (field.type === "textArc" && value.length > (field.maxLength ?? 44)) errors.push(`${field.label} may be too long for curved medal text.`);
  }

  for (const [fieldId, fontId] of Object.entries(state.fieldFontOverrides)) {
    const font = fonts.find((item) => item.id === fontId);
    if (!font) errors.push(`Invalid font override for ${fieldId}.`);
    if (font?.isScript && template.productType === "trophy") errors.push("Script fonts are not allowed on trophy base plate templates.");
    if (!template.allowedFontIds.includes(fontId)) errors.push(`Font ${fontId} is not allowed for this template.`);
  }

  return errors;
}

export function validateLogoFile(file: File): string[] {
  const errors: string[] = [];
  if (!allowedLogoMimeTypes.includes(file.type)) errors.push("Logo must be PNG, JPG, WEBP, SVG, or PDF.");
  if (file.size > maxLogoUploadBytes) errors.push("Logo upload must be 15 MB or smaller.");
  return errors;
}
