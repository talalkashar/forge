# Marketplace Credentials Setup

This checklist prepares FORGE for read-only Amazon SP-API and TikTok Shop import previews. Do not paste real credentials into this document. Store local values only in `.env.local`, and store production values only in the deployment environment.

## Safety Rules

- Do not guess external product, listing, ASIN, SKU, or shop IDs.
- Do not run `schema.sql` or `seed.sql`.
- Do not overwrite inventory.
- Do not commit `.env.local`.
- Do not use marketplace write APIs until a separate write-sync task is approved.
- Do not update Supabase marketplace mappings until the read-only preview output is reviewed and approved.

## Amazon SP-API

Use Amazon Seller Central and the Amazon Developer/Selling Partner API console to create or authorize the app. Amazon's SP-API authorization flow uses Login with Amazon (LWA); the local connector exchanges the refresh token for a short-lived access token before making read-only listing/catalog requests.

Start here:

- Seller Central: `https://sellercentral.amazon.com/`
- Amazon SP-API documentation: `https://developer-docs.amazon.com/sp-api/`
- Connect to SP-API: `https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api`
- Self-authorization for a private app: `https://developer-docs.amazon.com/sp-api/docs/self-authorization`
- SP-API roles: `https://developer-docs.amazon.com/sp-api/docs/roles-in-the-selling-partner-api`

Collect these values and add them manually to `.env.local`:

```bash
AMAZON_SELLER_ID=
AMAZON_MARKETPLACE_ID=
AMAZON_LWA_CLIENT_ID=
AMAZON_LWA_CLIENT_SECRET=
AMAZON_REFRESH_TOKEN=
AMAZON_REGION=
```

Required Amazon access:

- Seller account access for the FORGE Amazon account.
- SP-API developer access or an authorized SP-API application.
- Login with Amazon client ID and client secret.
- Seller authorization refresh token for the FORGE seller account.
- Marketplace ID for the target marketplace, for example the US marketplace.
- Region matching the marketplace, such as `na`, `eu`, or `fe`.
- Read access needed for listing/catalog preview, especially the Product Listing role and any catalog/listings permissions Amazon requires for the Listings Items and Catalog Items APIs.

Before FORGE can fetch real Amazon listings:

- All Amazon env vars above must be present.
- The app must be authorized for the FORGE seller account.
- The app must have listing/catalog read permissions.
- Existing Amazon listing SKUs should match FORGE SKUs when possible.
- Any stored Amazon `external_product_id`, `external_listing_id`, or `external_sku` in Supabase must come from a real preview or Seller Central export, not a guess.

## TikTok Shop

Use TikTok Shop Partner Center and Seller Center to create the app, enable read-only product scopes, and authorize the FORGE TikTok Shop seller account. The local connector uses the stored access token and shop ID to make read-only product preview requests.

Start here:

- TikTok Shop Partner Center: `https://partner.tiktokshop.com/`
- TikTok Shop Seller Center: `https://seller-us.tiktok.com/`
- TikTok Shop authorization overview: `https://partner.tiktokshop.com/docv2/page/authorization-overview-202407`
- TikTok Shop API concepts: `https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview`

Collect these values and add them manually to `.env.local`:

```bash
TIKTOK_SHOP_APP_KEY=
TIKTOK_SHOP_APP_SECRET=
TIKTOK_SHOP_REGION=
TIKTOK_SHOP_ACCESS_TOKEN=
TIKTOK_SHOP_REFRESH_TOKEN=
TIKTOK_SHOP_ID=
```

Required TikTok Shop access:

- TikTok Shop seller account access for FORGE.
- TikTok Shop Partner Center app access.
- App key and app secret.
- Seller authorization for the FORGE shop.
- Access token and refresh token from the seller authorization flow.
- Shop ID or shop cipher required by the TikTok Shop API flow used by the account.
- Region matching the shop/API endpoint.
- Minimum product read scopes/permissions needed to list products, SKUs, product status, inventory quantities returned by read endpoints, and shop identity.

Before FORGE can fetch real TikTok Shop products:

- All TikTok env vars above must be present.
- The app must be approved/usable for the FORGE shop.
- The seller account must authorize the app.
- Product read scopes must be enabled.
- Existing TikTok seller SKUs should match FORGE SKUs when possible.
- Any stored TikTok `external_product_id`, `external_listing_id`, or `external_sku` in Supabase must come from a real preview or Seller Center export, not a guess.

## Local Read-Only Sync Runbook

1. Add Amazon/TikTok credentials to `.env.local` manually.
2. Run the credential checker:

   ```bash
   node scripts/check-marketplace-credentials.mjs
   ```

3. Start the local app and open `/admin/sync/amazon` and `/admin/sync/tiktok`.
4. Run/read the read-only import preview output.
5. Review matched, unmatched, and manual-review rows.
6. Confirm that imported marketplace SKUs and external IDs are real.
7. Only after approval, create a separate Supabase mapping update task.
8. Never guess external IDs.

## Expected Preview Flow

- Missing credentials should show a clear `not_configured` state.
- Valid credentials should allow read-only fetch attempts.
- Imported marketplace rows should match Supabase by existing `marketplace_listings.external_sku`, then `product_variants.sku`, then stored external product/listing IDs.
- Unmatched rows should stay manual review until a human approves the mapping.
- Supabase updates are a separate, explicitly approved task.
