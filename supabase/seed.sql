-- WARNING:
-- Running this seed may reset marketplace seed data and can overwrite manually
-- edited inventory depending on the statements below.
-- Export live inventory before reseeding.

insert into public.products (
  id,
  slug,
  name,
  subtitle,
  description,
  category,
  status,
  base_price_cents,
  currency,
  brand,
  is_featured,
  sort_order
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'zeus',
    'Zeus Lever Belt',
    'Built to lock in your core under serious weight.',
    'A rigid FORGE lever belt built for aggressive bracing, fast setup, and heavy lower-body training sessions.',
    'Lifting Belt',
    'active',
    7997,
    'USD',
    'FORGE',
    true,
    10
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'berserk',
    'Berserk Lever Belt',
    'Bold lever belt variant with locked-in support.',
    'The Berserk variant keeps the same FORGE belt platform with a bold finish and locked-in support for compound lifts.',
    'Lifting Belt',
    'active',
    7997,
    'USD',
    'FORGE',
    true,
    20
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'black',
    'Black Lever Belt',
    'Stealth lever belt variant for heavy work.',
    'A stealth black FORGE lever belt with the same rigid platform, fast lever closure, and heavy-duty support.',
    'Lifting Belt',
    'active',
    7997,
    'USD',
    'FORGE',
    false,
    30
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'straps',
    'FORGE Lifting Straps',
    'Max out your lifts with comfort and control.',
    'Cotton-blend lifting straps with a secure wrap and padded wrist support for heavy pulls and higher-volume back work.',
    'Accessories',
    'active',
    999,
    'USD',
    'FORGE',
    true,
    40
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  category = excluded.category,
  status = excluded.status,
  base_price_cents = excluded.base_price_cents,
  currency = excluded.currency,
  brand = excluded.brand,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order;

insert into public.product_variants (
  product_id,
  sku,
  name,
  size,
  color,
  price_cents,
  inventory_quantity,
  stripe_price_id,
  stripe_product_id,
  is_active
) values
  ('11111111-1111-4111-8111-111111111111', 'FORGE-ZEUS-BELT-S', 'Zeus Lever Belt - S', 'S', 'Zeus', 7997, 18, null, null, true),
  ('11111111-1111-4111-8111-111111111111', 'FORGE-ZEUS-BELT-M', 'Zeus Lever Belt - M', 'M', 'Zeus', 7997, 24, null, null, true),
  ('11111111-1111-4111-8111-111111111111', 'FORGE-ZEUS-BELT-L', 'Zeus Lever Belt - L', 'L', 'Zeus', 7997, 24, null, null, true),
  ('11111111-1111-4111-8111-111111111111', 'FORGE-ZEUS-BELT-XL', 'Zeus Lever Belt - XL', 'XL', 'Zeus', 7997, 16, null, null, true),
  ('22222222-2222-4222-8222-222222222222', 'FORGE-BERSERK-BELT-S', 'Berserk Lever Belt - S', 'S', 'Berserk', 7997, 18, null, null, true),
  ('22222222-2222-4222-8222-222222222222', 'FORGE-BERSERK-BELT-M', 'Berserk Lever Belt - M', 'M', 'Berserk', 7997, 24, null, null, true),
  ('22222222-2222-4222-8222-222222222222', 'FORGE-BERSERK-BELT-L', 'Berserk Lever Belt - L', 'L', 'Berserk', 7997, 24, null, null, true),
  ('22222222-2222-4222-8222-222222222222', 'FORGE-BERSERK-BELT-XL', 'Berserk Lever Belt - XL', 'XL', 'Berserk', 7997, 16, null, null, true),
  ('33333333-3333-4333-8333-333333333333', 'FORGE-BLACK-BELT-S', 'Black Lever Belt - S', 'S', 'Black', 7997, 18, null, null, true),
  ('33333333-3333-4333-8333-333333333333', 'FORGE-BLACK-BELT-M', 'Black Lever Belt - M', 'M', 'Black', 7997, 24, null, null, true),
  ('33333333-3333-4333-8333-333333333333', 'FORGE-BLACK-BELT-L', 'Black Lever Belt - L', 'L', 'Black', 7997, 24, null, null, true),
  ('33333333-3333-4333-8333-333333333333', 'FORGE-BLACK-BELT-XL', 'Black Lever Belt - XL', 'XL', 'Black', 7997, 16, null, null, true),
  ('44444444-4444-4444-8444-444444444444', 'FORGE-STRAPS-BLACK', 'FORGE Lifting Straps - Black', null, 'Black', 999, 80, null, null, true)
on conflict (sku) do update set
  product_id = excluded.product_id,
  name = excluded.name,
  size = excluded.size,
  color = excluded.color,
  price_cents = excluded.price_cents,
  inventory_quantity = excluded.inventory_quantity,
  stripe_price_id = excluded.stripe_price_id,
  stripe_product_id = excluded.stripe_product_id,
  is_active = excluded.is_active;

delete from public.product_images
where product_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444'
);

insert into public.product_images (product_id, variant_id, src, alt, position, is_primary) values
  ('11111111-1111-4111-8111-111111111111', null, '/images/belts/listing/zeus/1.webp', 'FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View 1', 0, true),
  ('11111111-1111-4111-8111-111111111111', null, '/images/belts/listing/zeus/2.webp', 'FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View 2', 1, false),
  ('11111111-1111-4111-8111-111111111111', null, '/images/belts/listing/zeus/3.webp', 'FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View 3', 2, false),
  ('11111111-1111-4111-8111-111111111111', null, '/images/belts/listing/zeus/4.webp', 'FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View 4', 3, false),
  ('11111111-1111-4111-8111-111111111111', null, '/images/belts/listing/zeus/5.webp', 'FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View 5', 4, false),
  ('11111111-1111-4111-8111-111111111111', null, '/images/belts/listing/zeus/6.webp', 'FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View 6', 5, false),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/1.webp', 'Berserk Lever Belt product image view 1', 0, true),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/2.webp', 'Berserk Lever Belt product image view 2', 1, false),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/3.webp', 'Berserk Lever Belt product image view 3', 2, false),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/4.webp', 'Berserk Lever Belt product image view 4', 3, false),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/5.webp', 'Berserk Lever Belt product image view 5', 4, false),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/6.webp', 'Berserk Lever Belt product image view 6', 5, false),
  ('22222222-2222-4222-8222-222222222222', null, '/images/belts/listing/berserk/7.webp', 'Berserk Lever Belt product image view 7', 6, false),
  ('33333333-3333-4333-8333-333333333333', null, '/images/belts/listing/Black Lever Belt/1.webp', 'Black Lever Belt product image view 1', 0, true),
  ('33333333-3333-4333-8333-333333333333', null, '/images/belts/listing/Black Lever Belt/2.webp', 'Black Lever Belt product image view 2', 1, false),
  ('33333333-3333-4333-8333-333333333333', null, '/images/belts/listing/Black Lever Belt/3.webp', 'Black Lever Belt product image view 3', 2, false),
  ('33333333-3333-4333-8333-333333333333', null, '/images/belts/listing/Black Lever Belt/4.webp', 'Black Lever Belt product image view 4', 3, false),
  ('44444444-4444-4444-8444-444444444444', null, '/images/straps/listing/1-removebg.webp', 'FORGE Lifting Straps front product image', 0, true),
  ('44444444-4444-4444-8444-444444444444', null, '/images/straps/listing/2.webp', 'FORGE Lifting Straps product image view 2', 1, false),
  ('44444444-4444-4444-8444-444444444444', null, '/images/straps/listing/3.webp', 'FORGE Lifting Straps product image view 3', 2, false),
  ('44444444-4444-4444-8444-444444444444', null, '/images/straps/listing/4.webp', 'FORGE Lifting Straps product image view 4', 3, false),
  ('44444444-4444-4444-8444-444444444444', null, '/images/straps/listing/5.webp', 'FORGE Lifting Straps product image view 5', 4, false),
  ('44444444-4444-4444-8444-444444444444', null, '/images/straps/listing/6.webp', 'FORGE Lifting Straps product image view 6', 5, false);

delete from public.marketplace_listings
where product_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444'
)
and channel in ('website', 'stripe', 'amazon', 'tiktok_shop');

insert into public.marketplace_listings (
  product_id,
  variant_id,
  channel,
  external_product_id,
  external_listing_id,
  external_sku,
  listing_url,
  sync_status,
  notes
)
select
  products.id,
  null,
  'website',
  products.id::text,
  null,
  products.slug,
  case
    when lower(products.category) like '%belt%' then '/product/belt?variant=' || products.slug
    else '/product/' || products.slug
  end,
  'connected',
  'Website route mapping for the FORGE storefront.'
from public.products
where products.slug in ('zeus', 'berserk', 'black', 'straps');

insert into public.marketplace_listings (
  product_id,
  variant_id,
  channel,
  external_product_id,
  external_listing_id,
  external_sku,
  listing_url,
  sync_status,
  notes
)
select
  product_variants.product_id,
  product_variants.id,
  channels.channel,
  null,
  null,
  product_variants.sku,
  null,
  'not_connected',
  'Placeholder listing row. Add marketplace IDs after channel listings exist.'
from public.product_variants
cross join (values ('stripe'), ('amazon'), ('tiktok_shop')) as channels(channel)
where product_variants.sku in (
  'FORGE-ZEUS-BELT-S',
  'FORGE-ZEUS-BELT-M',
  'FORGE-ZEUS-BELT-L',
  'FORGE-ZEUS-BELT-XL',
  'FORGE-BERSERK-BELT-S',
  'FORGE-BERSERK-BELT-M',
  'FORGE-BERSERK-BELT-L',
  'FORGE-BERSERK-BELT-XL',
  'FORGE-BLACK-BELT-S',
  'FORGE-BLACK-BELT-M',
  'FORGE-BLACK-BELT-L',
  'FORGE-BLACK-BELT-XL',
  'FORGE-STRAPS-BLACK'
);

update public.marketplace_listings
set
  external_product_id = 'B0FN79GGQ9',
  listing_url = 'https://www.amazon.com/dp/B0FN79GGQ9',
  sync_status = 'needs_review',
  notes = 'ASIN and product URL found in the FORGE straps product specs. UPC: 199284264465. Confirm Seller Central listing ownership before marking synced.'
where channel = 'amazon'
  and external_sku = 'FORGE-STRAPS-BLACK';
