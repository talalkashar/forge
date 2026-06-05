# FORGE Deployment Checklist

## Current State

- Supabase is already seeded for the marketplace catalog.
- Expected live counts: 4 products, 13 variants, 23 images, 43 marketplace listings.
- The admin dashboard is available at `/admin`.

## Vercel Environment Variables

Add these in Vercel Project Settings:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DASHBOARD_PASSWORD`

Do not commit `.env.local`.

For production, set `NEXT_PUBLIC_BASE_URL` to `https://capacitygears.com`.

## Admin Subdomain Deployment

- Main storefront domain: `capacitygears.com`.
- Admin dashboard domain: `admin.capacitygears.com`.
- Add `admin.capacitygears.com` as a domain on the same Vercel project.
- Configure DNS using Vercel's instructions.
- The Next.js `proxy.ts` router maps admin subdomain paths to the existing admin routes:
  - `https://admin.capacitygears.com` -> `/admin`
  - `https://admin.capacitygears.com/products` -> `/admin/products`
  - `https://admin.capacitygears.com/marketplace` -> `/admin/marketplace`
  - `https://admin.capacitygears.com/inventory` -> `/admin/inventory`
  - `https://admin.capacitygears.com/sync` -> `/admin/sync`
- Test `https://admin.capacitygears.com` after deploy.
- If subdomain routing fails, use `/admin` on the main domain as the fallback URL.

## Pre-Deploy Security

- Rotate the Stripe secret key.
- Rotate the Supabase service role key if it was exposed.
- Change the admin dashboard password.
- Update `.env.local` with the rotated local values.
- Add the new values to Vercel Environment Variables.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is only used by server-side code.

## Manual Inventory Protection

- Treat manual inventory edits as live business data.
- Do not rerun `supabase/schema.sql` after manual inventory changes unless you are intentionally resetting Supabase.
- `supabase/seed.sql` may overwrite seed-managed product and variant rows.
- Before any reset or reseed, export inventory:

```bash
npm run inventory:export
```

- After a reseed, preview inventory restore by SKU:

```bash
npm run inventory:restore -- --dry-run backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json
```

- Then restore inventory by SKU:

```bash
npm run inventory:restore -- backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json
```

- Use `supabase/update-inventory-by-sku.sql` in the SQL Editor for a short manual SKU/quantity restore.

## Post-Deploy Tests

- Visit `/` and `/shop` and confirm product cards load.
- Visit `/product/belt?variant=zeus`, `/product/belt?variant=berserk`, `/product/belt?variant=black`, and `/product/straps`.
- Confirm product images render from the public image paths.
- Add a product to cart and verify the Stripe checkout entry point opens.
- Visit `/admin`, log in, and verify Products, Marketplace, Inventory, and Sync pages load.
- Check `/admin/marketplace?missing=1` for missing Stripe, Amazon, and TikTok Shop IDs.
- Check `/admin/sync` for marketplace readiness, inventory warnings, and the latest local inventory backup filename.

## Marketplace Sync Roadmap

See `docs/marketplace-sync-roadmap.md` for the phased plan from the current manual Supabase dashboard to Stripe hardening, Amazon/TikTok Shop read-only connectors, dry-run write sync, and controlled automation.
