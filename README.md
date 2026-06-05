This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Marketplace Database Setup

FORGE uses Supabase as the central catalog database for the website, Stripe checkout metadata, Amazon identifiers, TikTok Shop identifiers, and future inventory sync.

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Paste and run `supabase/seed.sql`.
5. Add these env vars locally in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_DASHBOARD_PASSWORD`
   - `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
6. Add the same env vars in Vercel Project Settings.
7. Run `npm run build`.
8. Visit `/admin`.
9. Log in with the admin password.
10. Edit products, inventory, and marketplace IDs.

The public anon key is only allowed to read active products, active variants, and product images through row level security. Public users cannot insert, update, or delete catalog, marketplace, inventory, order, or order item records.

Do not put `SUPABASE_SERVICE_ROLE_KEY` in client components. It is only for server-side admin operations and marketplace management. Do not commit `.env.local`.

Marketplace IDs are stored in `marketplace_listings`. Product-level website rows keep the live website slug/URL. Variant-level Stripe, Amazon, and TikTok Shop rows keep `external_product_id`, `external_listing_id`, `external_sku`, `listing_url`, and `sync_status`. Stripe IDs also live on `product_variants` as `stripe_product_id` and `stripe_price_id` because checkout pricing is variant-specific.

The seed file currently imports the real FORGE storefront catalog from the repo: Zeus Lever Belt, Berserk Lever Belt, Black Lever Belt, and FORGE Lifting Straps. It maps the actual public product image paths and product routes. The straps seed includes the ASIN found in the product specs; other Amazon and TikTok Shop IDs are intentionally blank.

To refresh Supabase after changing seed data, open the Supabase SQL Editor and run `supabase/seed.sql` again after `supabase/schema.sql` has already been applied. The seed updates the four known products, variants, image rows, and marketplace placeholder rows. It does not run automatically during `npm run build`.

Stripe checkout currently creates dynamic Stripe `price_data` from cart items in `app/api/checkout/route.ts`; no static Stripe Price IDs were found in the repo. Add real Stripe Product IDs and Price IDs manually in `/admin/products/[id]` for each variant when they exist.

Amazon and TikTok Shop syncing is manual for now. Add Amazon product/listing IDs and TikTok Shop product/listing IDs in `/admin/marketplace`. Do not enter guessed IDs; leave missing fields blank until the real marketplace listings exist.

Before real automatic sync, FORGE still needs Amazon Selling Partner API credentials, TikTok Shop API credentials, webhook/order ingestion, inventory adjustment rules, Stripe Price IDs populated for every live variant, and a scheduled sync job that writes `inventory_movements` and marketplace `last_synced_at` values.

See `docs/marketplace-sync-roadmap.md` for the phased marketplace sync plan. The `/admin/sync` page is the current read-only command center for website, Stripe, Amazon, and TikTok Shop readiness.

## Manual Inventory Protection

Manual inventory in Supabase is live business data. Do not rerun `supabase/schema.sql` after manual inventory changes unless you intentionally want to reset the database. `supabase/seed.sql` can also overwrite seed-managed catalog rows, including inventory quantities in `product_variants`.

Before any reset or reseed, export a snapshot:

```bash
npm run inventory:export
```

The snapshot is written to `backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json`. Backup JSON files are ignored by git.

After a reseed, preview the restore by SKU from a snapshot:

```bash
npm run inventory:restore -- --dry-run backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json
```

Then restore:

```bash
npm run inventory:restore -- backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json
```

There is also a SQL fallback template at `supabase/update-inventory-by-sku.sql` for restoring a short SKU/quantity list through the Supabase SQL Editor.

## Admin Subdomain Deployment

The main storefront domain is `capacitygears.com`. The preferred production admin dashboard domain is `admin.capacitygears.com`.

This project includes host-based Next.js `proxy.ts` routing so admin subdomain requests map to the existing admin routes:

- `https://admin.capacitygears.com` maps to `/admin`
- `https://admin.capacitygears.com/products` maps to `/admin/products`
- `https://admin.capacitygears.com/marketplace` maps to `/admin/marketplace`
- `https://admin.capacitygears.com/inventory` maps to `/admin/inventory`
- `https://admin.capacitygears.com/sync` maps to `/admin/sync`

Add `admin.capacitygears.com` as a domain on the same Vercel project as `capacitygears.com`, then configure DNS using Vercel's instructions. Set all required Vercel environment variables before deploying. `NEXT_PUBLIC_BASE_URL` should be `https://capacitygears.com` in production.

After deployment, test `https://admin.capacitygears.com`. If admin subdomain routing fails, the fallback admin URL is `/admin` on the main domain.

## Security and Deployment Checklist

- Rotate the Stripe secret key before production deploy.
- Rotate the Supabase service role key if it was exposed.
- Change `ADMIN_DASHBOARD_PASSWORD` before production deploy.
- Update `.env.local` with rotated local values.
- Never commit `.env.local`.
- Add secrets only through Vercel Environment Variables.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- `NEXT_PUBLIC_*` keys are intended for browser use.
- Do not expose the admin dashboard password in logs, screenshots, chat, or support notes.
