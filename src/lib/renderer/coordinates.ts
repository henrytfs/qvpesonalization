import type { EditableSurface, RectangleSurface } from "@/lib/types";

export function surfaceBounds(surface: EditableSurface): RectangleSurface {
  if (surface.type === "rectangle") return surface;
  if (surface.type === "circle") {
    return {
      id: surface.id,
      type: "rectangle",
      label: surface.label,
      safeMarginMm: surface.safeMarginMm,
      x: surface.centerX - surface.radius,
      y: surface.centerY - surface.radius,
      width: surface.radius * 2,
      height: surface.radius * 2,
      realWidthMm: surface.realDiameterMm,
      realHeightMm: surface.realDiameterMm,
    };
  }
  const xs = surface.points.map((point) => point.x);
  const ys = surface.points.map((point) => point.y);
  return {
    id: surface.id,
    type: "rectangle",
    label: surface.label,
    safeMarginMm: surface.safeMarginMm,
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    realWidthMm: surface.realWidthMm,
    realHeightMm: surface.realHeightMm,
  };
}

export function safeMarginPreviewPx(surface: EditableSurface): number {
  const bounds = surfaceBounds(surface);
  const mmWidth = "realDiameterMm" in surface ? surface.realDiameterMm : surface.realWidthMm;
  return (surface.safeMarginMm / mmWidth) * bounds.width;
}

export function previewToSurfaceMm(surface: EditableSurface, x: number, y: number) {
  const bounds = surfaceBounds(surface);
  const realWidth = "realDiameterMm" in surface ? surface.realDiameterMm : surface.realWidthMm;
  const realHeight = "realDiameterMm" in surface ? surface.realDiameterMm : surface.realHeightMm;
  return {
    x: ((x - bounds.x) / bounds.width) * realWidth,
    y: ((y - bounds.y) / bounds.height) * realHeight,
  };
}

export function previewSizeToSurfaceMm(surface: EditableSurface, width: number, height: number) {
  const bounds = surfaceBounds(surface);
  const realWidth = "realDiameterMm" in surface ? surface.realDiameterMm : surface.realWidthMm;
  const realHeight = "realDiameterMm" in surface ? surface.realDiameterMm : surface.realHeightMm;
  return {
    width: (width / bounds.width) * realWidth,
    height: (height / bounds.height) * realHeight,
  };
}
