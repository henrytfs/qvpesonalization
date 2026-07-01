# Coolify Deploy

This app is built as a standalone Next.js service for a domain such as `https://customize.quaviet.com`.

1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial_schema.sql`, then `supabase/migrations/0002_seed_reference_data.sql`.
3. Run `supabase/storage-policies.sql`.
4. Create a Coolify app from this repository.
5. Use Node `22.13.0` or newer.
6. Set Build Command to `npm run build`.
7. Set Start Command to `npm start`.
8. Use the included `Dockerfile` if choosing Docker-based deployment; do not pass secret Supabase keys as build arguments.
9. Add the variables from `.env.example` in Coolify runtime environment settings.
10. Deploy and check `/api/health`.

The app uses `next.config.mjs` standalone output for the Docker runtime.
