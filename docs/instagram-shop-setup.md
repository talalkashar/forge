# Instagram Shop setup (FORGE)

Checkout stays on **forgegym.us** (Stripe). Instagram Shop uses a Meta product catalog so you can tag products on posts/Reels and open a **Shop** tab. Orders are not fulfilled inside Instagram.

## What the site already provides

| Piece | Status |
|-------|--------|
| Product feed (CSV from live catalog) | `GET /api/feeds/meta-catalog` |
| PDPs + Stripe checkout | Live on forgegym.us |
| Inventory source of truth | TikTok Shop / Supabase variants (feed mirrors site stock) |

**Feed URL (production):**

```text
https://forgegym.us/api/feeds/meta-catalog
```

Optional secret (recommended after go-live):

1. Set `META_CATALOG_FEED_TOKEN` in Vercel (and `.env.local`).
2. Use:

```text
https://forgegym.us/api/feeds/meta-catalog?token=YOUR_TOKEN
```

## What only you can do (Meta)

No agent can log into Instagram / Business Manager for you. Complete this once:

### 1. Accounts

1. Instagram [@forgegym.us](https://www.instagram.com/forgegym.us/) → Professional → **Business**.
2. Create or claim a **Facebook Page** for FORGE / CAPACITY GEARS LLC.
3. Link Instagram ↔ Page in [Meta Business Suite](https://business.facebook.com/).
4. Confirm both assets are in the correct **Business Manager**.

### 2. Commerce Manager

1. Open [Commerce Manager](https://business.facebook.com/commerce).
2. Create a **catalog** (commerce / ecommerce, US).
3. Create a **Shop** and connect Instagram + Facebook Page.
4. **Claim domain** `forgegym.us` (Business settings → Brand safety / Domains).
5. Complete **business verification** if Meta requests it (legal name, address, docs for CAPACITY GEARS LLC).

### 3. Connect the FORGE feed

1. Catalog → **Data sources** → **Add items** → **Data feed** / scheduled feed.
2. Paste:

   `https://forgegym.us/api/feeds/meta-catalog`  
   (or the `?token=` URL if you set `META_CATALOG_FEED_TOKEN`)

3. Schedule: every **1–6 hours** (hourly is fine).
4. Currency / country: **USD / United States**.
5. Wait for first fetch → fix any rejected rows in Commerce Manager diagnostics.
6. Confirm SKUs match site/TikTok variant SKUs.

### 4. Turn shopping on

1. Connect the catalog to Instagram (Shop).
2. Wait until products show **Approved** / available for tagging.
3. Enable product tags on posts, Reels, and Stories.
4. Tag products on training/lifestyle content.
5. On phone: open a tag → lands on the correct `forgegym.us` PDP → cart → Stripe.

## Feed fields (per active variant)

| Column | Source |
|--------|--------|
| `id` | Variant SKU |
| `title` | Product name + size/color |
| `description` | Catalog description |
| `availability` | `in stock` if qty &gt; 0, else `out of stock` |
| `condition` | `new` |
| `price` | e.g. `79.97 USD` |
| `link` | Product URL on forgegym.us |
| `image_link` | Primary product image (absolute) |
| `brand` | FORGE GYM |
| `item_group_id` | Product slug (groups sizes) |
| `size` / `color` | Variant attributes when set |
| `quantity_to_sell_on_facebook` | Supabase `inventory_quantity` |

Inactive variants and products without images are omitted. Zero stock is listed as **out of stock** (not removed) so Meta can mark unavailable.

## Inventory rules

- Do **not** invent Instagram-only quantities.
- Keep Supabase aligned with TikTok Shop stock (existing FORGE rule).
- After inventory changes, Meta updates on the next scheduled feed pull (or force “Upload now” in Commerce Manager).

## Local smoke test

```bash
# No token
curl -sS "http://localhost:3001/api/feeds/meta-catalog" | head -20

# With token (if set in .env.local)
curl -sS "http://localhost:3001/api/feeds/meta-catalog?token=$META_CATALOG_FEED_TOKEN" | head -20
```

Expect a CSV header line starting with `id,title,description,...` and one row per active SKU.

## Not in scope (yet)

- Meta Checkout (buy inside Instagram) — separate payouts/shipping review.
- Order import from Instagram — not needed for website checkout.
- Meta Pixel / Conversions API — optional later for ads attribution.
- Admin `instagram` marketplace channel — optional mapping UI after Shop is live.

## Go-live checklist

- [ ] Instagram Business + Page linked
- [ ] Domain `forgegym.us` claimed
- [ ] Feed URL connected and first sync **success**
- [ ] Products approved for tagging
- [ ] Test tag → PDP → Stripe on phone
- [ ] (Optional) `META_CATALOG_FEED_TOKEN` set on Vercel
