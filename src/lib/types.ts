export type ProductType = "plaque" | "award" | "medal" | "trophy";
export type SurfaceType = "rectangle" | "circle" | "polygon";
export type FieldType = "text" | "image" | "textArc" | "asset";
export type TextAlign = "left" | "center" | "right";
export type PersonalizationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected" | "archived";

export type PaletteToken =
  | "background"
  | "primaryText"
  | "secondaryText"
  | "accent"
  | "border"
  | "highlightName"
  | "metallic";

export interface Product {
  id: string;
  sku: string;
  name: string;
  productType: ProductType;
  mockupImageUrl: string;
  defaultTemplateId: string;
}

export interface PreviewCanvas {
  width: number;
  height: number;
}

export interface BaseSurface {
  id: string;
  type: SurfaceType;
  label: string;
  safeMarginMm: number;
}

export interface RectangleSurface extends BaseSurface {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  realWidthMm: number;
  realHeightMm: number;
}

export interface CircleSurface extends BaseSurface {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
  realDiameterMm: number;
}

export interface PolygonPoint {
  x: number;
  y: number;
}

export interface PolygonSurface extends BaseSurface {
  type: "polygon";
  points: PolygonPoint[];
  realWidthMm: number;
  realHeightMm: number;
}

export type EditableSurface = RectangleSurface | CircleSurface | PolygonSurface;

export interface TemplateField {
  id: string;
  surfaceId: string;
  type: FieldType;
  label: string;
  defaultValue?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamilyId?: string;
  fontWeight?: string;
  align?: TextAlign;
  colorToken?: PaletteToken;
  editable: boolean;
  maxLength?: number;
  optional?: boolean;
  required?: boolean;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  arcPosition?: "top" | "bottom";
}

export interface Template {
  id: string;
  sku: string;
  name: string;
  productType: ProductType;
  mockupImageUrl: string;
  previewCanvas: PreviewCanvas;
  surfaces: EditableSurface[];
  fields: TemplateField[];
  defaultPaletteId: string;
  allowedPaletteIds: string[];
  allowedFontIds: string[];
  productionMethod?: string;
  productionNotes?: string[];
}

export interface TemplateAdjustment {
  version: 1;
  sku: string;
  templateId: string;
  mockupImageUrl?: string;
  previewCanvas?: PreviewCanvas;
  surfaces?: EditableSurface[];
  fields?: TemplateField[];
  updatedAt: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  productTypes: ProductType[];
  tokens: Record<PaletteToken, string>;
  productionNotes?: string[];
}

export interface FontOption {
  id: string;
  name: string;
  cssFamily: string;
  category: "serif" | "sans" | "script" | "display" | "system";
  supportsVietnamese: boolean;
  recommendedFor: ProductType[];
  isScript?: boolean;
}

export interface DesignAsset {
  id: string;
  name: string;
  category: "divider" | "star" | "laurel" | "corner" | "border" | "medal" | "sport";
  svg: string;
  allowedProductTypes: ProductType[];
  colorEditable: boolean;
  defaultColorToken: PaletteToken;
  productionSafe: boolean;
}

export interface PlacedAsset {
  id: string;
  assetId: string;
  surfaceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  colorToken: PaletteToken;
}

export interface PersonalizationState {
  id: string;
  sku: string;
  templateId: string;
  paletteId: string;
  fieldValues: Record<string, string>;
  fieldFontOverrides: Record<string, string>;
  fieldSizeOverrides: Record<string, number>;
  fieldColorTokenOverrides: Record<string, PaletteToken>;
  logoDataUrl?: string;
  logoStoragePath?: string;
  logoOriginalFilename?: string;
  logoMimeType?: string;
  logoSizeBytes?: number;
  selectedAssets: PlacedAsset[];
  status: PersonalizationStatus;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface RenderOutput {
  id: string;
  personalizationId: string;
  kind: "preview_png" | "preview_svg" | "proof_pdf" | "production_svg" | "layout_json";
  storagePath: string;
  mimeType: string;
  sizeBytes?: number;
  createdAt: string;
}
