import { getTikTokProductUrl, tiktokShop } from "@/lib/tiktok-shop";

export default function TikTokShopLink({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const url = getTikTokProductUrl(slug);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={
        className ||
        "inline-flex text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-white/70"
      }
    >
      Also on TikTok Shop →
    </a>
  );
}

export function TikTokStoreLink({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={tiktokShop.storeUrl}
      target="_blank"
      rel="noreferrer"
      className={
        className ||
        "inline-flex text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-white/70"
      }
    >
      Shop FORGE on TikTok →
    </a>
  );
}
