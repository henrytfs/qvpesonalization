# Illustrator Template JSON Export

Use this workflow when the production file must be exact in millimeters or inches.

## Recommended Setup

Create one Illustrator document per product template with the artboard set to the real editable area size.

Example:

- Plaque plate: `180 mm x 130 mm`
- Trophy base plate: `85 mm x 25 mm`
- Medal insert: `50 mm x 50 mm`

The artboard is the production coordinate system. The product photo is only for the website preview.

## Object Names

Draw rectangles for each editable area and field. Name them in Illustrator's Layers panel:

```text
surface:main_plate
field:logo:image
field:organization:text:fontSize=8:align=center
field:title:text:fontSize=13:align=center
field:recipient:text:fontSize=11:align=center
field:message:text:fontSize=7:align=center:optional=true
field:date:text:fontSize=7:align=center:optional=true
```

Supported field types:

- `text`
- `image`
- `textArc`
- `asset`

Useful metadata:

- `fontSize=8` means 8 mm production font size.
- `align=center`, `align=left`, or `align=right`.
- `fontFamilyId=clean-vietnamese`.
- `fontWeight=700`.
- `colorToken=primaryText`.
- `maxLength=60`.
- `optional=true`.
- `required=false`.

## Export

In Illustrator:

1. Open the real-size template file.
2. Go to `File > Scripts > Other Script...`.
3. Choose `tools/illustrator/export-quaviet-template-json.jsx`.
4. Enter the SKU, template ID, product type, mockup image URL, and preview surface position.
5. Save the JSON as `data/template-adjustments/SKU.json`.

## Why This Is Production Safe

The exported JSON includes both coordinate systems:

- Preview coordinates: `x`, `y`, `width`, `height`.
- Real production coordinates: `realXmm`, `realYmm`, `realWidthMm`, `realHeightMm`, `realFontSizeMm`.

The customer editor uses preview coordinates to align text on the product image.

The production SVG exporter prefers the real millimeter coordinates when present, so output size is based on the measured editable area, not screenshot pixels.

## App Import Location

For the MVP, save files here:

```text
data/template-adjustments/PLAQUE-6233G.json
```

The app automatically applies the adjustment file when loading templates for that SKU.
