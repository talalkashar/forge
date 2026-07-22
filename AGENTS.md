<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FORGE site — agent guide

Next.js App Router storefront for FORGE (lever belts, lifting straps). Stripe checkout + Supabase catalog/admin.

**Primary live domain:** `forgegym.us`. **Legacy:** `capacitygears.com` redirects to forgegym (keep for SEO/bookmarks). Vercel team: `talaldev`; project: `forge`; GitHub: `talalkashar/forge`. Keep `capacitygears@…` as a secondary Vercel login email if still owned — do not remove it just for cleanup.

## Inventory source of truth: TikTok Shop

- **Always reference TikTok Shop** for inventory decisions, stock counts, and SKU alignment.
- TikTok Shop store: `https://shop.tiktok.com/us/store/forgesports/7496252332747098142` (CAPACITY GEARS LLC / FORGE GYM).
- Product PDP map: `lib/tiktok-shop.ts` and `docs/tiktok-shop-products.md`.
- Supabase `product_variants.inventory_quantity` powers **website** checkout — keep it aligned with TikTok stock; do not invent website-only quantities that diverge from TikTok.
- Admin inventory UI (`/admin/inventory`) must show TikTok listing links per SKU.
- Marketplace listings channel `tiktok_shop` holds external product IDs / listing URLs.
- Full TikTok API inventory pull needs `TIKTOK_SHOP_ACCESS_TOKEN` + shop ID (partial credentials may already exist).

## Website skills (project-scoped)

Skills live under `.grok/skills/`. In Grok, invoke with slash commands. In Claude/Codex, **read the matching `SKILL.md` before domain work**.

| Skill | Path | Use for |
|-------|------|---------|
| **website-orchestrator** | `.grok/skills/website-orchestrator/SKILL.md` | Full site assessment / multi-domain program |
| brand-ui-director | `.grok/skills/brand-ui-director/SKILL.md` | Brand & visual identity |
| frontend-engineer | `.grok/skills/frontend-engineer/SKILL.md` | Next.js UI implementation |
| conversion-strategist | `.grok/skills/conversion-strategist/SKILL.md` | Funnel, cart, checkout CRO |
| motion-3d-director | `.grok/skills/motion-3d-director/SKILL.md` | Motion/3D decisions (bias: no new Three.js) |
| seo-strategist | `.grok/skills/seo-strategist/SKILL.md` | Metadata, sitemap, canonicals |
| accessibility-performance | `.grok/skills/accessibility-performance/SKILL.md` | A11y + performance |
| browser-qa | `.grok/skills/browser-qa/SKILL.md` | Live smoke / interaction QA |
| integrations-security | `.grok/skills/integrations-security/SKILL.md` | Stripe, Supabase, secrets |
| production-launch | `.grok/skills/production-launch/SKILL.md` | Go/no-go launch readiness |

Shared context: `.grok/skills/website-orchestrator/references/forge-context.md`

### Default workflow

1. Assessment-only first unless the user explicitly asks for code changes.
2. Full audits → start with **website-orchestrator**.
3. Single-domain work → open only that skill.
4. Security and inventory safety outrank visual novelty.

## How to verify a change

```bash
npm run lint
npm run build
```

Browser smoke: homepage → shop → product → cart → checkout initiation (prefer Stripe test mode).

## Boundaries

- Do not commit `.env.local` or secrets.
- Never put `SUPABASE_SERVICE_ROLE_KEY` or Stripe secret keys in client components.
- Do not display marketplace secret values in admin UI.
- Do not rerun `supabase/schema.sql` or casually reseed after manual inventory edits.
- Before any inventory-risking reset: `npm run inventory:export`
- Ask first before deploy, force-push, dependency major upgrades, or expanding Three.js.

## Useful docs

- `README.md` — setup, Supabase, marketplace notes
- `docs/deployment-checklist.md`
- `docs/marketplace-sync-roadmap.md`
- `docs/marketplace-credentials-setup.md`
