-- DO NOT RUN WITHOUT APPROVAL.
-- This is a future marketplace sync planning migration.
-- It is intentionally separate from schema.sql because live Supabase inventory
-- is already in use and must not be reset or overwritten by connector planning.

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  channel text not null,
  status text not null default 'pending',
  dry_run boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  sync_job_id uuid references public.sync_jobs(id) on delete set null,
  channel text not null,
  event_type text not null,
  status text not null default 'recorded',
  dry_run boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  external_event_id text,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.channel_inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  external_product_id text,
  external_listing_id text,
  external_sku text,
  quantity integer,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.marketplace_credentials_status (
  id uuid primary key default gen_random_uuid(),
  channel text not null unique,
  status text not null default 'not_configured',
  dry_run boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists sync_jobs_channel_idx on public.sync_jobs(channel);
create index if not exists sync_jobs_status_idx on public.sync_jobs(status);
create index if not exists sync_events_channel_idx on public.sync_events(channel);
create index if not exists webhook_events_channel_idx on public.webhook_events(channel);
create index if not exists webhook_events_external_event_id_idx
  on public.webhook_events(external_event_id);
create index if not exists channel_inventory_snapshots_channel_idx
  on public.channel_inventory_snapshots(channel);
create index if not exists channel_inventory_snapshots_variant_id_idx
  on public.channel_inventory_snapshots(variant_id);
