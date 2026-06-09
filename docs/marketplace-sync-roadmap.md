# FORGE Marketplace Sync Roadmap

This roadmap keeps Supabase as the source of truth while FORGE moves from manual marketplace management to controlled automation. Do not enable Amazon or TikTok Shop writes until credentials, dry-run diffs, and inventory safety checks are in place.

Current channel state:

- Website is ready.
- Stripe is ready after `/admin/stripe` created or reused Product/Price IDs.
- Amazon is blocked until real Seller Central/SP-API credentials and listing IDs are added.
- TikTok Shop is blocked until real TikTok Shop credentials and product/listing IDs are added.
- No Amazon/TikTok write automation exists yet.

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

- Configure Amazon Selling Partner API access with optional env vars only:
  - `AMAZON_SELLER_ID`
  - `AMAZON_MARKETPLACE_ID`
  - `AMAZON_LWA_CLIENT_ID`
  - `AMAZON_LWA_CLIENT_SECRET`
  - `AMAZON_REFRESH_TOKEN`
  - `AMAZON_REGION`
- `/admin/sync` checks credential presence without exposing values.
- Pull listings, orders, and inventory into a read-only comparison job.
- Match Amazon listings by existing marketplace external SKU, Supabase variant SKU, then ASIN if an ASIN is already stored.
- Display Supabase vs Amazon differences in `/admin/sync` and `/admin/sync/amazon`.
- Require manual approval before writing any proposed mapping back to Supabase.
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

- Configure TikTok Shop API access with optional env vars only:
  - `TIKTOK_SHOP_APP_KEY`
  - `TIKTOK_SHOP_APP_SECRET`
  - `TIKTOK_SHOP_ACCESS_TOKEN`
  - `TIKTOK_SHOP_REFRESH_TOKEN`
  - `TIKTOK_SHOP_ID`
  - `TIKTOK_SHOP_REGION`
- `/admin/sync` checks credential presence without exposing values.
- Pull products, orders, and inventory into a read-only comparison job.
- Match TikTok Shop listings by existing marketplace external SKU, Supabase variant SKU, then product/listing ID if one is already stored.
- Display Supabase vs TikTok Shop differences in `/admin/sync` and `/admin/sync/tiktok`.
- Require manual approval before writing any proposed mapping back to Supabase.
- Do not write product, listing, price, or inventory changes back to TikTok Shop yet.
- The TikTok OAuth callback route is scaffolded at `/api/marketplaces/tiktok/callback`.
- The callback route can receive TikTok `code`, `state`, and `error` redirects, but token exchange and token storage are intentionally disabled until explicitly approved.
- The callback route must not log authorization codes, exchange tokens, mutate Supabase, or call TikTok write APIs.

TikTok Shop credentials/checklist:

- TikTok Shop seller account.
- Developer/app access.
- App key and app secret.
- Access token and refresh token flow.
- Shop/cipher ID if required by the API flow.
- Warehouse, shipping, and category requirements.
- SKU mappings stored in Supabase marketplace listings.

TikTok approval and authorization flow:

1. Create the TikTok Shop Partner Center app/service.
2. Add the FORGE callback URL: `https://capacitygears.com/api/marketplaces/tiktok/callback`.
3. Enable only the minimum read-only scopes needed for product, order, inventory, and shop identity previews.
4. Complete company details review.
5. Complete partner registration review.
6. Complete US data security review.
7. Complete data security and privacy review.
8. Submit app review and wait for approval.
9. After approval, authorize the FORGE TikTok Shop seller account.
10. Exchange the authorization code for access/refresh tokens only after the token exchange implementation is reviewed and explicitly enabled.
11. Store resulting values as Vercel/local env vars, never in source control:
    - `TIKTOK_SHOP_ACCESS_TOKEN`
    - `TIKTOK_SHOP_REFRESH_TOKEN`
    - `TIKTOK_SHOP_ID`

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

The planning file `supabase/future-sync-schema.sql` sketches these tables for later review. Do not run it without explicit approval.

## Exact Next Implementation Path

1. Add real Amazon and TikTok Shop credentials to local/Vercel env vars.
2. Finish TikTok app review and seller authorization.
3. Enable TikTok token exchange only after approval and code review.
4. Implement Amazon read-only listing import preview.
5. Implement TikTok Shop read-only product import preview.
6. Match imported rows to Supabase variants by SKU and existing marketplace IDs.
7. Show dry-run diffs in `/admin/sync`, `/admin/sync/amazon`, and `/admin/sync/tiktok`.
8. Let the admin approve marketplace mapping updates manually.
9. Import orders read-only and display order-to-variant matches.
10. Create `inventory_movements` from imported orders only after review.
11. Enable controlled write sync later, after dry-runs are trusted.
