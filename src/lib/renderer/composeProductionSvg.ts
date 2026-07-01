import { designAssets } from "@/data/assets";
import { fonts } from "@/data/fonts";
import type { ColorPalette, EditableSurface, PersonalizationState, Template, TemplateField } from "@/lib/types";
import { previewSizeToSurfaceMm, previewToSurfaceMm, surfaceBounds } from "./coordinates";
import { tokenColor } from "./paletteTokens";
import { escapeAttribute, escapeXml } from "./svgEscaping";
import { splitTextIntoLines, textAnchor } from "./textLayout";

interface ProductionOptions {
  palette: ColorPalette;
  generatedAt?: string;
}

function primarySurface(template: Template): EditableSurface {
  const surface = template.surfaces[0];
  if (!surface) throw new Error(`Template ${template.id} has no editable surface.`);
  return surface;
}

function surfaceSizeMm(surface: EditableSurface) {
  if (surface.type === "circle") return { width: surface.realDiameterMm, height: surface.realDiameterMm };
  return { width: surface.realWidthMm, height: surface.realHeightMm };
}

function fontFamily(field: TemplateField, state: PersonalizationState, template: Template) {
  const overrideId = state.fieldFontOverrides[field.id];
  const fontId = overrideId && template.allowedFontIds.includes(overrideId) ? overrideId : field.fontFamilyId;
  return fonts.find((font) => font.id === fontId)?.cssFamily ?? "Arial, Helvetica, sans-serif";
}

function renderText(field: TemplateField, state: PersonalizationState, template: Template, surface: EditableSurface, palette: ColorPalette) {
  const value = state.fieldValues[field.id] ?? field.defaultValue ?? "";
  const pos = previewToSurfaceMm(surface, field.x, field.y);
  const width = field.width ? previewSizeToSurfaceMm(surface, field.width, 0).width : undefined;
  const size = ((state.fieldSizeOverrides[field.id] ?? field.fontSize ?? 20) / surfaceBounds(surface).height) * surfaceSizeMm(surface).height;
  const color = tokenColor(palette, state.fieldColorTokenOverrides[field.id] ?? field.colorToken);
  const x = field.align === "left" && width ? pos.x - width / 2 : field.align === "right" && width ? pos.x + width / 2 : pos.x;
  const lines = splitTextIntoLines(value, width ? Math.max(10, Math.floor(width / (size * 0.42))) : 36);
  return `<text x="${x.toFixed(2)}" y="${pos.y.toFixed(2)}" text-anchor="${textAnchor(field.align)}" font-family="${escapeAttribute(fontFamily(field, state, template))}" font-size="${size.toFixed(2)}" font-weight="${field.fontWeight ?? "400"}" fill="${color}">
    ${lines.map((line, index) => `<tspan x="${x.toFixed(2)}" dy="${index === 0 ? 0 : (size * 1.18).toFixed(2)}">${escapeXml(line)}</tspan>`).join("")}
  </text>`;
}

function renderLogo(field: TemplateField, state: PersonalizationState, surface: EditableSurface) {
  const pos = previewToSurfaceMm(surface, field.x, field.y);
  const size = previewSizeToSurfaceMm(surface, field.width ?? 120, field.height ?? 60);
  const href = state.logoStoragePath ? `supabase://${state.logoStoragePath}` : state.logoDataUrl;
  if (!href) {
    return `<!-- Optional logo omitted -->`;
  }
  return `<!-- TODO: sanitize uploaded SVG/PDF/AI-derived logos before production path conversion. --><image href="${escapeAttribute(href)}" x="${pos.x.toFixed(2)}" y="${pos.y.toFixed(2)}" width="${size.width.toFixed(2)}" height="${size.height.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/>`;
}

function renderTextArc(field: TemplateField, state: PersonalizationState, template: Template, surface: EditableSurface, palette: ColorPalette) {
  const center = previewToSurfaceMm(surface, field.x, field.y);
  const radius = previewSizeToSurfaceMm(surface, field.radius ?? 120, field.radius ?? 120).width;
  const start = ((field.startAngle ?? 200) * Math.PI) / 180;
  const end = ((field.endAngle ?? 340) * Math.PI) / 180;
  const x1 = center.x + radius * Math.cos(start);
  const y1 = center.y + radius * Math.sin(start);
  const x2 = center.x + radius * Math.cos(end);
  const y2 = center.y + radius * Math.sin(end);
  const largeArc = Math.abs((field.endAngle ?? 340) - (field.startAngle ?? 200)) > 180 ? 1 : 0;
  const sweep = field.arcPosition === "bottom" ? 0 : 1;
  const pathId = `${state.id}-${field.id}-production-arc`;
  const size = ((state.fieldSizeOverrides[field.id] ?? field.fontSize ?? 18) / surfaceBounds(surface).height) * surfaceSizeMm(surface).height;
  const color = tokenColor(palette, state.fieldColorTokenOverrides[field.id] ?? field.colorToken);
  const value = state.fieldValues[field.id] ?? field.defaultValue ?? "";
  return `
    <defs><path id="${escapeAttribute(pathId)}" d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArc} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}"/></defs>
    <text font-family="${escapeAttribute(fontFamily(field, state, template))}" font-size="${size.toFixed(2)}" font-weight="${field.fontWeight ?? "700"}" fill="${color}">
      <textPath href="#${escapeAttribute(pathId)}" startOffset="50%" text-anchor="middle">${escapeXml(value)}</textPath>
    </text>
  `;
}

function renderAssets(state: PersonalizationState, surface: EditableSurface, palette: ColorPalette) {
  return state.selectedAssets
    .map((placed) => {
      const asset = designAssets.find((item) => item.id === placed.assetId);
      if (!asset) return "";
      const pos = previewToSurfaceMm(surface, placed.x, placed.y);
      const size = previewSizeToSurfaceMm(surface, placed.width, placed.height);
      return `<g transform="translate(${pos.x.toFixed(2)} ${pos.y.toFixed(2)}) rotate(${placed.rotation} ${(size.width / 2).toFixed(2)} ${(size.height / 2).toFixed(2)})" color="${tokenColor(palette, placed.colorToken)}"><svg width="${size.width.toFixed(2)}" height="${size.height.toFixed(2)}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">${asset.svg.replace(/<\/?svg[^>]*>/g, "")}</svg></g>`;
    })
    .join("");
}

export function composeProductionSvg(template: Template, state: PersonalizationState, options: ProductionOptions): string {
  const surface = primarySurface(template);
  const size = surfaceSizeMm(surface);
  const palette = options.palette;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const fields = template.fields
    .map((field) => {
      if (field.type === "image") return renderLogo(field, state, surface);
      if (field.type === "textArc") return renderTextArc(field, state, template, surface, palette);
      if (field.type === "text") return renderText(field, state, template, surface, palette);
      return "";
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- sku: ${escapeXml(template.sku)} -->
<!-- templateId: ${escapeXml(template.id)} -->
<!-- personalizationId: ${escapeXml(state.id)} -->
<!-- generatedAt: ${escapeXml(generatedAt)} -->
${(template.productionNotes ?? []).map((note) => `<!-- productionNote: ${escapeXml(note)} -->`).join("\n")}
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}mm" height="${size.height}mm" viewBox="0 0 ${size.width} ${size.height}">
  <rect x="0" y="0" width="${size.width}" height="${size.height}" fill="${tokenColor(palette, "background")}"/>
  ${renderAssets(state, surface, palette)}
  ${fields}
</svg>`;
}
