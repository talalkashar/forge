/** Official FORGE GYM TikTok Shop (CAPACITY GEARS LLC). */
export const tiktokShop = {
  storeName: "FORGE GYM",
  storeUrl:
    "https://shop.tiktok.com/us/store/forgesports/7496252332747098142",
  seller: "CAPACITY GEARS LLC",
  products: {
    berserk: {
      title: "FORGE GYM Berserk Lever Weight Lifting Belt – 10mm",
      url: "https://shop.tiktok.com/us/pdp/forge-berserk-lever-weight-lifting-belt-10mm-leather/1732188731557711902",
      productId: "1732188731557711902",
    },
    zeus: {
      title: "FORGE GYM Zeus Lever Weight Lifting Belt – 10mm",
      url: "https://shop.tiktok.com/us/pdp/forge-zeus-lever-weight-lifting-belt-10mm-leather-steel-buckle/1732272740357935134",
      productId: "1732272740357935134",
    },
    black: {
      title: "FORGE GYM Black Lever Weight Lifting Belt – 10mm",
      // No separate TikTok PDP found — fall back to store
      url: "https://shop.tiktok.com/us/store/forgesports/7496252332747098142",
      productId: null as string | null,
    },
    straps: {
      title: "FORGE GYM Heavy-Duty Lifting Straps – Black",
      url: "https://shop.tiktok.com/us/pdp/forge-heavy-duty-lifting-straps-black-color-strong-durable/1731536802672513054",
      productId: "1731536802672513054",
    },
  },
} as const;

export type TikTokProductSlug = keyof typeof tiktokShop.products;

export function getTikTokProductUrl(slug: string): string {
  const entry = tiktokShop.products[slug as TikTokProductSlug];
  return entry?.url ?? tiktokShop.storeUrl;
}

export function getTikTokProductTitle(slug: string): string | null {
  const entry = tiktokShop.products[slug as TikTokProductSlug];
  return entry?.title ?? null;
}
