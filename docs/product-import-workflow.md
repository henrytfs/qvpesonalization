# Product Import Workflow

Use the admin import tool when adding a Quaviet SKU to the personalization system.

## Import Page

Open:

```text
/admin/import-product
```

Upload:

- Product image: JPG, PNG, or WebP.
- Illustrator JSON: exported from `tools/illustrator/export-quaviet-template-json.jsx`.
- SKU: the exact SKU Quaviet.com will pass later, for example `PLAQUE-6014`.
- Product name.
- Product type.

After import, the app creates:

```text
public/products/{sku}.jpg
data/imported-products.json
data/imported-templates.json
data/template-adjustments/{SKU}.json
```

Then the product is available at:

```text
/editor/{SKU}
```

## Recommended SKU Convention

Use product-type prefixes so the personalization app can avoid conflicts:

```text
PLAQUE-6014
AWARD-CMA-AG
TROPHY-FOOTBALL-001
MEDAL-46870
```

Quaviet.com can later pass this SKU into the iframe/widget URL:

```text
https://personalize.quaviet.com/editor/PLAQUE-6014
```

## Production Persistence

The MVP import tool is file-backed. In Coolify, make sure the runtime paths that hold imported data and images are persisted with a volume, otherwise imported products may be lost on redeploy.

Persist:

```text
data/
public/products/
```

When this moves to Supabase, these should become database rows and storage objects instead of local files.
