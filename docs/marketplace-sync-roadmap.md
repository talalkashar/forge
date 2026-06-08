# FORGE Marketplace Sync Roadmap

This roadmap keeps Supabase as the source of truth while FORGE moves from manual marketplace management to controlled automation. Do not enable Amazon or TikTok Shop writes until credentials, dry-run diffs, and inventory safety checks are in place.

## Phase 1: Current System

- Supabase catalog tables for products, variants, images, marketplace listings, inventory movements, orders, and order items.
- Admin dashboard for products, inventory, marketplace mappings, and sync readiness.
- Manual inventory management with inventory movement records.
- Manual marketplace mappings for website, Stripe, Amazon, and TikTok Shop.
- Read-only `/admin/sync` dashboard showing missing IDs, review states, SKU coverage, image coverage, and inventory warnings.
- Inventory export/restore scripts for protecting live inventory before any reset or reseed.

## Phase 2: Stripe Product/Price Automation

- Use `/admin/stripe` as the dry-run-first Stripe setup command center.
- Show every active Supabase variant, SKU, price, current Stripe IDs, and the exact Stripe Product/Price that would be created or reused.
- Create or reuse Stripe Products and Prices for each live variant only after admin confirmation.
- Store Stripe Product IDs and Price IDs on `product_variants`.
- Update only Stripe `marketplace_listings` rows with connected Product/Price IDs, SKU, sync status, and sync timestamp.
- Do not create checkout sessions, charge customers, touch inventory, or mutate Amazon/TikTok Shop rows from the Stripe setup page.
- Keep dynamic Stripe checkout only if it remains intentional for launch speed.
- Move checkout toward Supabase-backed variant validation before creating a Stripe session.
- Prevent checkout for inactive variants or variants with insufficient inventory.
- Decide whether inventory is reserved at checkout creation, payment success, or fulfillment.

## Phase 3: Amazon Read-Only Connector

- Configure Amazon Selling Partner API access.
- Pull listings, orders, and inventory into a read-only comparison job.
- Match Amazon listings by SKU and ASIN.
- Display Supabase vs Amazon differences in `/admin/sync`.
- Do not write product, listing, price, or inventory changes back to Amazon yet.

Amazon credentials/checklist:

- Seller Central account.
- SP-API developer access.
- Login With Amazon client ID and client secret.
- Refresh token.
- Seller ID.
- Marketplace ID.
- Approved roles for listings, orders, and inventory.
- SKU and ASIN mappings stored in Supabase marketplace listings.

## Phase 4: TikTok Shop Read-Only Connector

- Configure TikTok Shop API access.
- Pull products, orders, and inventory into a read-only comparison job.
- Match TikTok Shop listings by SKU.
- Display Supabase vs TikTok Shop differences in `/admin/sync`.
- Do not write product, listing, price, or inventory changes back to TikTok Shop yet.

TikTok Shop credentials/checklist:

- TikTok Shop seller account.
- Developer/app access.
- App key and app secret.
- Access token and refresh token flow.
- Shop/cipher ID if required by the API flow.
- Warehouse, shipping, and category requirements.
- SKU mappings stored in Supabase marketplace listings.

## Phase 5: Dry-Run Write Sync

- Generate proposed product, price, listing, and inventory updates.
- Show before/after changes in `/admin/sync`.
- Require manual confirmation before any marketplace write.
- Record proposed and confirmed changes in sync logs.
- Block writes when SKUs, marketplace IDs, or inventory data are missing.

## Phase 6: Controlled Automation

- Scheduled sync jobs.
- Marketplace webhooks.
- Sync event logs.
- Retry queue for transient API failures.
- Inventory movement ledger for every stock change.
- Error dashboard with channel-specific remediation.
- Oversell protection through reservation or atomic inventory decrement rules.

## Likely Future Tables

Add these later as non-destructive migrations when connector work starts:

- `sync_jobs`
- `sync_events`
- `webhook_events`
- `channel_inventory_snapshots`
- `marketplace_credentials_status`

These tables are intentionally not part of the current schema reset because live manual inventory is already in Supabase and should not be disturbed.
