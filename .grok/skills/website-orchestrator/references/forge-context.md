# FORGE site context (shared)

## Identity

- Brand: FORGE / FORGE Gym
- Live storefront(s): `https://forgegym.us` (also referenced as capacitygears.com in deployment docs — confirm which domain is primary before SEO or redirect work)
- Repo: this repository (`forge-site`)
- Product category: lifting belts, lever belts, wrist straps / lifting straps

## Stack (verify in package.json before assuming)

- Next.js App Router (`app/`)
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Three.js is already a dependency — do **not** expand 3D usage without explicit approval and a cost/benefit case
- Stripe checkout (`app/api/checkout`, cart → success flow)
- Supabase catalog, variants, inventory, marketplace IDs
- **Inventory source of truth: TikTok Shop** (FORGE GYM store on TikTok). Website Supabase qty must mirror TikTok; always show/link TikTok when discussing stock (`lib/tiktok-shop.ts`, `/admin/inventory`, `/admin/sync/tiktok`).
- Admin dashboard at `/admin` (password-gated; may also use admin subdomain)

## Key routes

- `/` — homepage
- `/shop` — catalog
- `/product/[...]` — product detail + variants
- `/cart` — cart
- Checkout API → Stripe → `/success` / `/cancel`
- `/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`
- `/admin/*` — products, inventory, marketplace, sync

## Key paths

- `app/` — routes and API
- `components/` — UI
- `lib/` — products, supabase, security, performance helpers
- `public/` — static assets and product images
- `supabase/` — schema + seed (seed can overwrite live catalog/inventory — treat carefully)
- `docs/deployment-checklist.md`
- `docs/marketplace-sync-roadmap.md`
- `docs/marketplace-credentials-setup.md`

## Hard boundaries

- Do not commit `.env.local` or secrets
- Never put `SUPABASE_SERVICE_ROLE_KEY` in client components
- Never display Amazon/TikTok/Stripe secret values in admin UI
- Do not rerun `supabase/schema.sql` or casually reseed after manual inventory edits
- Export inventory before any reset: `npm run inventory:export`
- Read `AGENTS.md` and Next docs under `node_modules/next/dist/docs/` before framework-sensitive code
- Prefer reversible, local changes; ask before deploy, force-push, schema resets, or dependency major upgrades

## Verify commands

```bash
npm run lint
npm run build
```

No full automated test suite is assumed unless you find one. Use build + manual/browser QA.
