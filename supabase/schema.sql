drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.inventory_movements cascade;
drop table if exists public.marketplace_listings cascade;
drop table if exists public.product_images cascade;
drop table if exists public.product_variants cascade;
drop table if exists public.products cascade;
drop table if exists public.content_posts cascade;
drop table if exists public.inventory cascade;
drop table if exists public.sales cascade;

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  subtitle text,
  description text,
  category text not null,
  status text not null default 'active',
  base_price_cents integer not null,
  currency text not null default 'USD',
  brand text default 'FORGE',
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_status_check'
  ) then
    alter table public.products
      add constraint products_status_check
      check (status in ('active', 'draft', 'archived'));
  end if;
end;
$$;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique not null,
  name text not null,
  size text,
  color text,
  price_cents integer,
  inventory_quantity integer default 0,
  stripe_price_id text,
  stripe_product_id text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  src text not null,
  alt text not null,
  position integer default 0,
  is_primary boolean default false
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  channel text not null,
  external_product_id text,
  external_listing_id text,
  external_sku text,
  listing_url text,
  sync_status text default 'not_connected',
  last_synced_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_channel_check'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_channel_check
      check (channel in ('website', 'stripe', 'amazon', 'tiktok_shop'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_sync_status_check'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_sync_status_check
      check (sync_status in (
        'not_connected',
        'draft',
        'connected',
        'needs_review',
        'synced',
        'error'
      ));
  end if;
end;
$$;

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  channel text not null,
  quantity_change integer not null,
  reason text not null,
  external_order_id text,
  created_at timestamp with time zone default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inventory_movements_channel_check'
  ) then
    alter table public.inventory_movements
      add constraint inventory_movements_channel_check
      check (channel in ('manual', 'website', 'stripe', 'amazon', 'tiktok_shop'));
  end if;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  external_order_id text,
  customer_email text,
  status text not null,
  subtotal_cents integer,
  shipping_cents integer,
  tax_cents integer,
  total_cents integer,
  created_at timestamp with time zone default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_channel_check'
  ) then
    alter table public.orders
      add constraint orders_channel_check
      check (channel in ('website', 'stripe', 'amazon', 'tiktok_shop'));
  end if;
end;
$$;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null,
  unit_price_cents integer not null,
  created_at timestamp with time zone default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create index if not exists product_variants_sku_idx on public.product_variants (sku);
create index if not exists product_variants_is_active_idx on public.product_variants (is_active);

create index if not exists product_images_product_id_idx on public.product_images (product_id);
create index if not exists product_images_variant_id_idx on public.product_images (variant_id);

create index if not exists marketplace_listings_product_id_idx on public.marketplace_listings (product_id);
create index if not exists marketplace_listings_variant_id_idx on public.marketplace_listings (variant_id);
create index if not exists marketplace_listings_channel_idx on public.marketplace_listings (channel);
create index if not exists marketplace_listings_external_product_id_idx on public.marketplace_listings (external_product_id);
create index if not exists marketplace_listings_external_listing_id_idx on public.marketplace_listings (external_listing_id);
create index if not exists marketplace_listings_external_sku_idx on public.marketplace_listings (external_sku);

create index if not exists inventory_movements_variant_id_idx on public.inventory_movements (variant_id);
create index if not exists inventory_movements_channel_idx on public.inventory_movements (channel);
create index if not exists inventory_movements_external_order_id_idx on public.inventory_movements (external_order_id);

create index if not exists orders_channel_idx on public.orders (channel);
create index if not exists orders_external_order_id_idx on public.orders (external_order_id);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists order_items_variant_id_idx on public.order_items (variant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists set_marketplace_listings_updated_at on public.marketplace_listings;
create trigger set_marketplace_listings_updated_at
before update on public.marketplace_listings
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated, service_role;

grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.product_images to anon, authenticated;

grant all on public.products to service_role;
grant all on public.product_variants to service_role;
grant all on public.product_images to service_role;
grant all on public.marketplace_listings to service_role;
grant all on public.inventory_movements to service_role;
grant all on public.orders to service_role;
grant all on public.order_items to service_role;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
on public.product_variants
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.status = 'active'
  )
);

drop policy if exists "Public can read active product images" on public.product_images;
create policy "Public can read active product images"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.status = 'active'
  )
  and (
    product_images.variant_id is null
    or exists (
      select 1
      from public.product_variants
      where product_variants.id = product_images.variant_id
        and product_variants.is_active = true
    )
  )
);
