# Google Search Console — FORGE (`forgegym.us`)

Primary domain: **https://forgegym.us**  
Legacy (keep redirect only): **capacitygears.com** → forgegym.us

Use this after deploying the SEO package so Google sees one clean host.

---

## 1. Confirm the live site is clean

In a browser or terminal, check:

| Check | Expected |
|--------|----------|
| `https://forgegym.us/sitemap.xml` | Every `<loc>` starts with `https://forgegym.us` (not capacitygears) |
| `https://forgegym.us/robots.txt` | `Sitemap: https://forgegym.us/sitemap.xml` |
| Homepage HTML | `rel="canonical"` → forgegym.us; OG image on forgegym.us |
| `capacitygears.com` | 308/301 → forgegym.us |

If the sitemap still lists capacitygears, production env or deploy is stale — fix before submitting in GSC.

**Vercel production env (recommended):**

```bash
NEXT_PUBLIC_BASE_URL=https://forgegym.us
```

Optional HTML verification tag (from GSC → Settings → Ownership verification):

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=paste_token_here
```

Redeploy after changing env vars.

---

## 2. Property in Search Console

You already have a property. Prefer one of:

1. **Domain property** `forgegym.us` (covers apex + www) — best  
2. **URL-prefix** `https://forgegym.us/`

If you only verified capacitygears.com earlier, add **forgegym.us** as the primary property and use that going forward.

---

## 3. Submit the sitemap

1. Open the **forgegym.us** property  
2. **Sitemaps** (left nav)  
3. Add: `sitemap.xml`  
4. Submit  

Full URL Google will fetch: `https://forgegym.us/sitemap.xml`

Wait for status **Success**. If it fails, re-check step 1.

---

## 4. Request indexing (priority URLs)

**URL Inspection** → paste each URL → **Request indexing**:

1. `https://forgegym.us/`
2. `https://forgegym.us/shop`
3. `https://forgegym.us/product/belt`
4. `https://forgegym.us/product/straps`
5. `https://forgegym.us/shop/belts`
6. `https://forgegym.us/shop/wrist-straps`
7. `https://forgegym.us/about`

Do a few per day if Google rate-limits requests.

---

## 5. Removals / cleanup (optional but useful)

If old **capacitygears.com** URLs still appear as indexed:

1. Open the capacitygears property (if you have it), or use the domain property  
2. Confirm redirects work (they should already 308 to forgegym)  
3. Do **not** block capacitygears in robots — redirects are enough  
4. In time, Google consolidates to forgegym.us via redirects + new sitemap  

Optional: **Removals** tool only for junk URLs that should not wait for natural drop (use sparingly).

---

## 6. What to watch weekly

| Report | Healthy sign |
|--------|----------------|
| **Page indexing** | Home, shop, PDPs **Indexed**; cart/success/admin not indexed |
| **Sitemaps** | Discovered URLs match storefront routes |
| **Experience** | No flood of mobile usability errors |
| **Performance** (after data appears) | Queries like `forge gym belt`, `forgegym`, product names |

Brand query reality check:

- **“forge gym”** alone competes with real gyms — slow  
- **“forge gym belt”**, **forgegym.us**, **FORGE GYM lever belt** — faster wins  

---

## 7. Lily (later)

Same playbook: one canonical domain, correct sitemap host, GSC property for that domain only, request index on home + key product pages. Do FORGE first so the process is proven.

---

## Code touchpoints (this repo)

| File | Role |
|------|------|
| `lib/site.ts` | Canonical `https://forgegym.us` for all SEO signals |
| `lib/seo.ts` | Per-page title, description, canonical, OG |
| `app/robots.ts` | Crawl rules + sitemap line |
| `app/sitemap.ts` | Indexable routes |
| `app/layout.tsx` | Org/WebSite JSON-LD + optional GSC verification meta |
