-- Manual inventory restore helper.
--
-- Use this after a reseed/reset if you need to restore known quantities by SKU.
-- Replace the example rows in desired_inventory with real SKU/quantity pairs.
-- This updates only product_variants.inventory_quantity and records
-- inventory_movements with channel = manual and reason = inventory_restore.

with desired_inventory(sku, inventory_quantity) as (
  values
    ('FORGE-ZEUS-BELT-S', 18),
    ('FORGE-ZEUS-BELT-M', 24)
),
changes as (
  select
    product_variants.id as variant_id,
    product_variants.sku,
    product_variants.inventory_quantity as previous_quantity,
    desired_inventory.inventory_quantity as next_quantity,
    desired_inventory.inventory_quantity - coalesce(product_variants.inventory_quantity, 0) as quantity_change
  from public.product_variants
  join desired_inventory on desired_inventory.sku = product_variants.sku
  where coalesce(product_variants.inventory_quantity, 0) <> desired_inventory.inventory_quantity
),
updated as (
  update public.product_variants
  set inventory_quantity = changes.next_quantity
  from changes
  where product_variants.id = changes.variant_id
  returning changes.variant_id, changes.quantity_change
)
insert into public.inventory_movements (
  variant_id,
  channel,
  quantity_change,
  reason
)
select
  variant_id,
  'manual',
  quantity_change,
  'inventory_restore'
from updated;
