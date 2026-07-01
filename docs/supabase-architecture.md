# Supabase Architecture

The customer editor reads catalog data through the Next.js `/api/templates` route. Seed TypeScript data is included so the editor can run during local development, but Supabase rows are preferred when configured.

Personalization writes go through server API routes only. The browser never receives `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.

Tables:

- `products`, `templates`, `color_palettes`, `font_options`, `design_assets`: reference catalog data.
- `personalizations`: customer-entered layout JSON, selected palette/font overrides, selected design assets, and logo metadata.
- `render_outputs`: generated SVG/JSON artifacts stored in Supabase Storage.
- `audit_events`: reserved for future staff and system audit trails.

Buckets:

- `customer-uploads`: private original customer logos.
- `render-outputs`: private generated production SVG and layout JSON.

Local JSON persistence exists only as a development fallback when Supabase env vars are missing. Production should configure Supabase and private storage buckets.
