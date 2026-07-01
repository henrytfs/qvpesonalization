-- Optional storage policies for Supabase Auth admin access.
-- MVP Next.js API routes can use the server-only secret/service-role client.

alter table storage.objects enable row level security;

drop policy if exists "Admins can read Quaviet storage objects" on storage.objects;
create policy "Admins can read Quaviet storage objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id in ('customer-uploads', 'render-outputs')
    and public.is_admin()
  );

drop policy if exists "Admins can manage Quaviet storage objects" on storage.objects;
create policy "Admins can manage Quaviet storage objects"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id in ('customer-uploads', 'render-outputs')
    and public.is_admin()
  )
  with check (
    bucket_id in ('customer-uploads', 'render-outputs')
    and public.is_admin()
  );
