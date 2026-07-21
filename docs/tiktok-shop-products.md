# FORGE GYM × TikTok Shop

**Store:** https://shop.tiktok.com/us/store/forgesports/7496252332747098142  
**Seller:** CAPACITY GEARS LLC

## Inventory rule

**TikTok Shop is the inventory source of truth.**  
Website Supabase quantities power Stripe checkout and must stay aligned with TikTok stock. Always open/reference TikTok when changing or reporting inventory (`/admin/inventory`, `npm run inventory:status`, `lib/tiktok-shop.ts`).

## Products wired on forgegym site

| Slug | Site | TikTok |
|------|------|--------|
| berserk | /product/belt?variant=berserk | https://shop.tiktok.com/us/pdp/forge-berserk-lever-weight-lifting-belt-10mm-leather/1732188731557711902 |
| zeus | /product/belt?variant=zeus | https://shop.tiktok.com/us/pdp/forge-zeus-lever-weight-lifting-belt-10mm-leather-steel-buckle/1732272740357935134 |
| black | /product/belt?variant=black | store (no separate PDP found) |
| straps | /product/straps | https://shop.tiktok.com/us/pdp/forge-heavy-duty-lifting-straps-black-color-strong-durable/1731536802672513054 |

## Images

TikTok PDP galleries are captcha-gated for bots. The site uses FORGE GYM product photography already in `public/images/` (heroes + sharp galleries), which are the same product line sold on TikTok Shop.

To swap in fresh Seller Center exports later:
1. Drop files in `public/images/tiktok-source/{slug}/`
2. `bash scripts/import-tiktok-images.sh {slug}`
