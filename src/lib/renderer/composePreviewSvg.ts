import { designAssets } from "@/data/assets";
import { fonts } from "@/data/fonts";
import type { ColorPalette, EditableSurface, PersonalizationState, Template, TemplateField } from "@/lib/types";
import { surfaceBounds, safeMarginPreviewPx } from "./coordinates";
import { tokenColor } from "./paletteTokens";
import { escapeAttribute, escapeXml } from "./svgEscaping";
import { splitTextIntoLines, textAnchor } from "./textLayout";

interface PreviewOptions {
  palette: ColorPalette;
  showSafeAreas?: boolean;
}

function fontFamily(field: TemplateField, state: PersonalizationState, template: Template) {
  const overrideId = state.fieldFontOverrides[field.id];
  const fontId = overrideId && template.allowedFontIds.includes(overrideId) ? overrideId : field.fontFamilyId;
  return fonts.find((font) => font.id === fontId)?.cssFamily ?? "Arial, Helvetica, sans-serif";
}

function surfaceGuide(surface: EditableSurface, palette: ColorPalette, showSafeAreas?: boolean) {
  const guide = tokenColor(palette, "border");
  if (surface.type === "circle") {
    const margin = safeMarginPreviewPx(surface);
    return `
      <circle cx="${surface.centerX}" cy="${surface.centerY}" r="${surface.radius}" fill="rgba(255,255,255,0.18)" stroke="${guide}" stroke-width="2" stroke-dasharray="8 10"/>
      ${showSafeAreas ? `<circle cx="${surface.centerX}" cy="${surface.centerY}" r="${surface.radius - margin}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 8"/>` : ""}
    `;
  }
  if (surface.type === "polygon") {
    const points = surface.points.map((point) => `${point.x},${point.y}`).join(" ");
    return `<polygon points="${points}" fill="rgba(255,255,255,0.16)" stroke="${guide}" stroke-width="2" stroke-dasharray="8 10"/>`;
  }
  const margin = safeMarginPreviewPx(surface);
  return `
    <rect x="${surface.x}" y="${surface.y}" width="${surface.width}" height="${surface.height}" fill="rgba(255,255,255,0.16)" stroke="${guide}" stroke-width="2" stroke-dasharray="8 10"/>
    ${showSafeAreas ? `<rect x="${surface.x + margin}" y="${surface.y + margin}" width="${surface.width - margin * 2}" height="${surface.height - margin * 2}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 8"/>` : ""}
  `;
}

function renderText(field: TemplateField, state: PersonalizationState, template: Template, palette: ColorPalette) {
  const value = state.fieldValues[field.id] ?? field.defaultValue ?? "";
  const size = state.fieldSizeOverrides[field.id] ?? field.fontSize ?? 20;
  const color = tokenColor(palette, state.fieldColorTokenOverrides[field.id] ?? field.colorToken);
  const lines = splitTextIntoLines(value, field.width ? Math.max(12, Math.floor(field.width / (size * 0.52))) : 36);
  const anchor = textAnchor(field.align);
  const x = field.align === "left" && field.width ? field.x - field.width / 2 : field.align === "right" && field.width ? field.x + field.width / 2 : field.x;
  return `<text x="${x}" y="${field.y}" text-anchor="${anchor}" font-family="${escapeAttribute(fontFamily(field, state, template))}" font-size="${size}" font-weight="${field.fontWeight ?? "400"}" fill="${color}">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * 1.18}">${escapeXml(line)}</tspan>`).join("")}
  </text>`;
}

function arcPath(field: TemplateField) {
  const radius = field.radius ?? 120;
  const start = ((field.startAngle ?? 200) * Math.PI) / 180;
  const end = ((field.endAngle ?? 340) * Math.PI) / 180;
  const x1 = field.x + radius * Math.cos(start);
  const y1 = field.y + radius * Math.sin(start);
  const x2 = field.x + radius * Math.cos(end);
  const y2 = field.y + radius * Math.sin(end);
  const largeArc = Math.abs((field.endAngle ?? 340) - (field.startAngle ?? 200)) > 180 ? 1 : 0;
  const sweep = field.arcPosition === "bottom" ? 0 : 1;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function renderTextArc(field: TemplateField, state: PersonalizationState, template: Template, palette: ColorPalette) {
  const value = state.fieldValues[field.id] ?? field.defaultValue ?? "";
  const pathId = `${state.id}-${field.id}-arc`;
  const size = state.fieldSizeOverrides[field.id] ?? field.fontSize ?? 18;
  const color = tokenColor(palette, state.fieldColorTokenOverrides[field.id] ?? field.colorToken);
  return `
    <defs><path id="${escapeAttribute(pathId)}" d="${arcPath(field)}"/></defs>
    <text font-family="${escapeAttribute(fontFamily(field, state, template))}" font-size="${size}" font-weight="${field.fontWeight ?? "700"}" fill="${color}">
      <textPath href="#${escapeAttribute(pathId)}" startOffset="50%" text-anchor="middle">${escapeXml(value)}</textPath>
    </text>
  `;
}

function renderLogo(field: TemplateField, state: PersonalizationState) {
  if (!state.logoDataUrl) {
    return `<rect x="${field.x}" y="${field.y}" width="${field.width ?? 120}" height="${field.height ?? 60}" rx="8" fill="rgba(255,255,255,0.45)" stroke="#94a3b8" stroke-dasharray="8 8"/><text x="${field.x + (field.width ?? 120) / 2}" y="${field.y + (field.height ?? 60) / 2 + 5}" text-anchor="middle" font-size="16" fill="#475569">Logo</text>`;
  }
  return `<image href="${escapeAttribute(state.logoDataUrl)}" x="${field.x}" y="${field.y}" width="${field.width ?? 120}" height="${field.height ?? 60}" preserveAspectRatio="xMidYMid meet"/>`;
}

function renderAssets(state: PersonalizationState, palette: ColorPalette) {
  return state.selectedAssets
    .map((placed) => {
      const asset = designAssets.find((item) => item.id === placed.assetId);
      if (!asset) return "";
      const color = tokenColor(palette, placed.colorToken);
      return `<g transform="translate(${placed.x} ${placed.y}) rotate(${placed.rotation} ${placed.width / 2} ${placed.height / 2})" color="${color}"><svg width="${placed.width}" height="${placed.height}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">${asset.svg.replace(/<\/?svg[^>]*>/g, "")}</svg></g>`;
    })
    .join("");
}

export function composePreviewSvg(template: Template, state: PersonalizationState, options: PreviewOptions): string {
  const { palette, showSafeAreas } = options;
  const fields = template.fields
    .map((field) => {
      if (field.type === "image") return renderLogo(field, state);
      if (field.type === "textArc") return renderTextArc(field, state, template, palette);
      if (field.type === "text") return renderText(field, state, template, palette);
      return "";
    })
    .join("");
  const guides = template.surfaces.map((surface) => surfaceGuide(surface, palette, showSafeAreas)).join("");
  const primary = template.surfaces[0] ? surfaceBounds(template.surfaces[0]) : undefined;
  const backing = primary ? `<rect x="${primary.x}" y="${primary.y}" width="${primary.width}" height="${primary.height}" fill="${tokenColor(palette, "background")}" opacity="0.72"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${template.previewCanvas.width} ${template.previewCanvas.height}" role="img" aria-label="Personalization preview">
    ${backing}
    ${guides}
    ${renderAssets(state, palette)}
    ${fields}
  </svg>`;
}
