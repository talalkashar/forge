# FORGE

**Live:** https://forgegym.us  
**Legacy domain:** https://capacitygears.com → redirects to forgegym.us  
**Repo:** https://github.com/talalkashar/forge  
**Vercel:** team `talaldev` · project `forge` (Hobby)

Premium gym gear storefront for **FORGE** (lever belts, lifting straps) — owned brand e-commerce with Stripe checkout and a Supabase-backed catalog / admin inventory dashboard.

**Stack:** Next.js · TypeScript · React · Stripe · Supabase · Tailwind · Vercel

---

## What this project is (portfolio)

| Area | Details |
|------|---------|
| **Role** | Sole developer — storefront UI, cart/checkout, admin catalog |
| **Public site** | Home, shop, product pages, cart, contact, policies |
| **Payments** | Stripe Checkout from cart |
| **Data** | Supabase products, variants, images, marketplace IDs |
| **Admin** | Password-protected `/admin` for inventory & listings |
| **Roadmap** | Amazon / TikTok Shop connector hooks (readiness + docs) |

This is a **production brand site**, not a tutorial demo.

---

## Local development

```bash
cp .env.example .env.local   # fill keys — never commit .env.local
bash start.sh                # or: npm run dev -- -p 3001
```

Open http://localhost:3000 (or the port `start.sh` prints).

Required env vars are listed in `.env.example` (Stripe, Supabase, admin password, base URL).

```bash
npm run lint
npm run build
```

Smoke: homepage → shop → product → cart → checkout (prefer Stripe **test** mode).

---

## Marketplace / database setup

FORGE uses Supabase as the central catalog for the website, Stripe checkout metadata, Amazon identifiers, TikTok Shop identifiers, and future inventory sync.

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Paste and run `supabase/seed.sql`.
5. Add env vars locally in `.env.local` and in Vercel (see `.env.example`).
6. Run `npm run build`.
7. Visit `/admin`, log in with `ADMIN_DASHBOARD_PASSWORD`, edit products/inventory.

Optional Amazon / TikTok connector env vars are documented in `.env.example`. The sync dashboard only checks whether values exist — it must never display secret values.

Do **not** put `SUPABASE_SERVICE_ROLE_KEY` in client components. Do **not** commit `.env.local`.

See:

- `docs/marketplace-sync-roadmap.md`
- `docs/deployment-checklist.md`
- `docs/marketplace-credentials-setup.md`

---

## Inventory (TikTok Shop is source of truth)

- **Always reference TikTok Shop** for stock decisions.
- Store: https://shop.tiktok.com/us/store/forgesports/7496252332747098142
- Supabase `product_variants.inventory_quantity` is the **website** mirror used for Stripe checkout — keep it aligned with TikTok.
- Product map: `lib/tiktok-shop.ts`
- Admin: `/admin/inventory` (shows TikTok links per SKU)
- Status: `npm run inventory:status`

### Inventory protection

Manual inventory in Supabase is live business data. Before any reset or reseed:

```bash
npm run inventory:export
```

Snapshots go to `backups/` (gitignored). Restore helpers:

```bash
npm run inventory:restore -- --dry-run backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json
npm run inventory:restore -- backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json
```

---

## Agent / contributor notes

See **[AGENTS.md](./AGENTS.md)** for boundaries (secrets, inventory safety, deploy rules).
