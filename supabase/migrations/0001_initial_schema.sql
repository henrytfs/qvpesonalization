-- Quà Việt Personalization Studio: Initial Supabase schema
-- Run this in Supabase SQL Editor or via Supabase CLI.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Utility functions
-- -----------------------------------------------------------------------------

create or replace function public.generate_personalization_id()
returns text
language sql
as $$
  select 'psn_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin users for optional Supabase Auth-based admin access
-- -----------------------------------------------------------------------------

create table if not exists public.admin_users (
  email text primary key,
  name text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "Admins can read admin_users" on public.admin_users;
create policy "Admins can read admin_users"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Catalog and template tables
-- -----------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  product_type text not null check (product_type in ('plaque', 'award', 'medal', 'trophy')),
  mockup_image_url text,
  default_template_id text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id text primary key,
  sku text not null references public.products(sku) on update cascade on delete restrict,
  name text not null,
  product_type text not null check (product_type in ('plaque', 'award', 'medal', 'trophy')),
  version integer not null default 1,
  config jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  drop constraint if exists products_default_template_fk;

alter table public.products
  add constraint products_default_template_fk
  foreign key (default_template_id)
  references public.templates(id)
  deferrable initially deferred;

create table if not exists public.color_palettes (
  id text primary key,
  name text not null,
  product_types text[] not null default '{}',
  tokens jsonb not null,
  production_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.font_options (
  id text primary key,
  name text not null,
  css_family text not null,
  category text not null,
  supports_vietnamese boolean not null default true,
  recommended_for text[] not null default '{}',
  is_script boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_assets (
  id text primary key,
  name text not null,
  category text not null,
  svg text not null,
  allowed_product_types text[] not null default '{}',
  color_editable boolean not null default true,
  default_color_token text not null default 'accent',
  production_safe boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Personalization sessions and generated outputs
-- -----------------------------------------------------------------------------

create table if not exists public.personalizations (
  id text primary key default public.generate_personalization_id(),
  sku text not null references public.products(sku) on update cascade on delete restrict,
  template_id text not null references public.templates(id) on update cascade on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'archived')),
  palette_id text references public.color_palettes(id) on update cascade on delete set null,

  field_values jsonb not null default '{}'::jsonb,
  field_font_overrides jsonb not null default '{}'::jsonb,
  field_size_overrides jsonb not null default '{}'::jsonb,
  field_color_token_overrides jsonb not null default '{}'::jsonb,
  selected_assets jsonb not null default '[]'::jsonb,

  logo_storage_path text,
  logo_original_filename text,
  logo_mime_type text,
  logo_size_bytes bigint,

  customer jsonb not null default '{}'::jsonb,
  quantity integer,
  staff_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.render_outputs (
  id uuid primary key default gen_random_uuid(),
  personalization_id text not null references public.personalizations(id) on delete cascade,
  kind text not null check (kind in ('preview_png', 'preview_svg', 'proof_pdf', 'production_svg', 'layout_json')),
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  personalization_id text references public.personalizations(id) on delete set null,
  event_type text not null,
  actor_type text not null default 'system' check (actor_type in ('customer', 'admin', 'system')),
  actor_email text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_templates_sku_active on public.templates (sku, is_active);
create index if not exists idx_products_type_active on public.products (product_type, is_active);
create index if not exists idx_personalizations_sku_created_at on public.personalizations (sku, created_at desc);
create index if not exists idx_personalizations_status_created_at on public.personalizations (status, created_at desc);
create index if not exists idx_render_outputs_personalization_kind on public.render_outputs (personalization_id, kind);

-- -----------------------------------------------------------------------------
-- Updated-at triggers
-- -----------------------------------------------------------------------------

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_templates_updated_at on public.templates;
create trigger trg_templates_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_color_palettes_updated_at on public.color_palettes;
create trigger trg_color_palettes_updated_at
before update on public.color_palettes
for each row execute function public.set_updated_at();

drop trigger if exists trg_font_options_updated_at on public.font_options;
create trigger trg_font_options_updated_at
before update on public.font_options
for each row execute function public.set_updated_at();

drop trigger if exists trg_design_assets_updated_at on public.design_assets;
create trigger trg_design_assets_updated_at
before update on public.design_assets
for each row execute function public.set_updated_at();

drop trigger if exists trg_personalizations_updated_at on public.personalizations;
create trigger trg_personalizations_updated_at
before update on public.personalizations
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.templates enable row level security;
alter table public.color_palettes enable row level security;
alter table public.font_options enable row level security;
alter table public.design_assets enable row level security;
alter table public.personalizations enable row level security;
alter table public.render_outputs enable row level security;
alter table public.audit_events enable row level security;

-- Public catalog/template data can be read by the customer editor.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active templates" on public.templates;
create policy "Public can read active templates"
  on public.templates
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active palettes" on public.color_palettes;
create policy "Public can read active palettes"
  on public.color_palettes
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active fonts" on public.font_options;
create policy "Public can read active fonts"
  on public.font_options
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active design assets" on public.design_assets;
create policy "Public can read active design assets"
  on public.design_assets
  for select
  to anon, authenticated
  using (is_active = true);

-- Customer personalization rows are accessed through Next.js API routes using
-- the server-only secret/service-role client in MVP. Admin direct access can be
-- enabled through Supabase Auth by adding emails to public.admin_users.
drop policy if exists "Admins can read personalizations" on public.personalizations;
create policy "Admins can read personalizations"
  on public.personalizations
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update personalizations" on public.personalizations;
create policy "Admins can update personalizations"
  on public.personalizations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read render outputs" on public.render_outputs;
create policy "Admins can read render outputs"
  on public.render_outputs
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read audit events" on public.audit_events;
create policy "Admins can read audit events"
  on public.audit_events
  for select
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage buckets
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'customer-uploads',
    'customer-uploads',
    false,
    15728640,
    array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']
  ),
  (
    'render-outputs',
    'render-outputs',
    false,
    20971520,
    array['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf', 'application/json']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
