/**
 * Canonical site identity for SEO, Open Graph, sitemap, robots, and JSON-LD.
 * One source of truth — never emit capacitygears.com in public SEO signals.
 */

const CANONICAL_ORIGIN = "https://forgegym.us";

/**
 * Resolve the public origin used in sitemap, robots, metadataBase, OG, JSON-LD.
 * - localhost / 127.0.0.1 → keep for local previews
 * - anything else (including legacy capacitygears.com or wrong env) → forgegym.us
 *
 * Checkout / webhooks may still accept legacy hosts; those live outside this helper.
 */
export function resolveSiteUrl(
  raw: string | undefined = process.env.NEXT_PUBLIC_BASE_URL,
): string {
  const trimmed = (raw || CANONICAL_ORIGIN).trim().replace(/\/$/, "");
  try {
    const { hostname } = new URL(trimmed);
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return trimmed;
    }
  } catch {
    return CANONICAL_ORIGIN;
  }
  return CANONICAL_ORIGIN;
}

export const site = {
  name: "FORGE GYM",
  shortName: "FORGE",
  legalName: "CAPACITY GEARS LLC",
  tagline: "Premium Strength Gear",
  /**
   * Meta / search description only (Google, social previews).
   * Not the full on-page marketing copy.
   */
  description:
    "Shop FORGE GYM 10mm lever belts and heavy-duty wrist straps built for squats, deadlifts, and heavy training. Secure Stripe checkout at forgegym.us.",
  /**
   * Default <title> / Open Graph title for the homepage and root layout.
   */
  searchTitle: "FORGE GYM | Lever Belts & Wrist Straps for Heavy Training",
  /**
   * Canonical production origin (apex). www redirects here via Vercel.
   * Used for sitemap, robots, metadataBase, Open Graph, and JSON-LD.
   */
  url: resolveSiteUrl(),
  /** Default share / OG image (product-forward, not only logo) */
  ogImage: "/images/og/forge-og.jpg",
  /** Default product heroes for image sitemaps & rich results */
  productImages: [
    "/images/belts/listing/berserk/main.jpg",
    "/images/belts/listing/zeus/main.jpg",
    "/images/belts/listing/black/gallery-v7-1.jpg",
    "/images/straps/listing/gallery-v4-1.webp",
  ],
  email: "contact@forgegym.us",
  instagram: "https://www.instagram.com/forgegym.us/",
  tiktokShop:
    "https://shop.tiktok.com/us/store/forgesports/7496252332747098142",
  /** Brand keywords for metadata (not stuffing — genuine product / brand terms) */
  keywords: [
    "FORGE GYM",
    "forge gym",
    "forgegym",
    "forgegym.us",
    "FORGE lever belt",
    "10mm lever belt",
    "powerlifting belt",
    "weight lifting belt",
    "lever weightlifting belt",
    "Berserk lever belt",
    "Zeus lever belt",
    "lifting straps",
    "wrist straps",
    "deadlift straps",
    "gym gear",
    "strength training belt",
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return site.url;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
