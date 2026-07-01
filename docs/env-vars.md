# Environment Variables

`NEXT_PUBLIC_APP_URL`: Public app URL, for example `https://customize.quaviet.com`.

`NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Public browser-safe Supabase key.

`NEXT_PUBLIC_SUPABASE_ANON_KEY`: Legacy fallback for public catalog reads.

`SUPABASE_SECRET_KEY`: Server-only Supabase secret used by API routes.

`SUPABASE_SERVICE_ROLE_KEY`: Legacy fallback if `SUPABASE_SECRET_KEY` is absent.

`SUPABASE_STORAGE_BUCKET_UPLOADS`: Defaults to `customer-uploads`.

`SUPABASE_STORAGE_BUCKET_OUTPUTS`: Defaults to `render-outputs`.

`ADMIN_EMAILS`: Reserved for future authenticated admin access.

`INTERNAL_API_SECRET`: Reserved for future trusted Quaviet.com integration calls.
