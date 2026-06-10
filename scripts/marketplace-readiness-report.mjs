import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const envKeys = {
  supabase: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ],
  stripe: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
  amazon: [
    "AMAZON_SELLER_ID",
    "AMAZON_MARKETPLACE_ID",
    "AMAZON_LWA_CLIENT_ID",
    "AMAZON_LWA_CLIENT_SECRET",
    "AMAZON_REFRESH_TOKEN",
    "AMAZON_REGION",
  ],
  tiktok: [
    "TIKTOK_SHOP_APP_KEY",
    "TIKTOK_SHOP_APP_SECRET",
    "TIKTOK_SHOP_ACCESS_TOKEN",
    "TIKTOK_SHOP_REFRESH_TOKEN",
    "TIKTOK_SHOP_ID",
    "TIKTOK_SHOP_REGION",
  ],
};

const adminProductSelect = `
  id,
  slug,
  name,
  status,
  sort_order,
  product_variants (
    id,
    sku,
    name,
    size,
    inventory_quantity,
    stripe_price_id,
    stripe_product_id,
    is_active
  ),
  marketplace_listings (
    id,
    product_id,
    variant_id,
    channel,
    external_product_id,
    external_listing_id,
    external_sku,
    sync_status
  )
`;

async function loadLocalEnv() {
  try {
    const contents = await readFile(".env.local", "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      process.env[key] ??= valueParts.join("=").replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Vercel and CI should provide env vars directly.
  }
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function present(key) {
  return Boolean(process.env[key]?.trim());
}

function envPresence(keys) {
  return Object.fromEntries(keys.map((key) => [key, present(key) ? "present" : "missing"]));
}

function listingReady(listing) {
  return Boolean(
    listing?.external_product_id &&
      listing.external_listing_id &&
      listing.external_sku &&
      listing.sync_status !== "error",
  );
}

function listingLabel(listing, variantsById) {
  const variant = listing.variant_id ? variantsById.get(listing.variant_id) : null;

  return {
    channel: listing.channel,
    product: listing.product_name,
    sku: variant?.sku ?? listing.external_sku ?? "product-level",
    status: listing.sync_status ?? "missing_status",
    hasExternalProductId: Boolean(listing.external_product_id),
    hasExternalListingId: Boolean(listing.external_listing_id),
  };
}

await loadLocalEnv();

const supabase = createClient(
  requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const { data, error } = await supabase
  .from("products")
  .select(adminProductSelect)
  .order("sort_order", { ascending: true })
  .order("name", { ascending: true });

if (error) {
  throw new Error(`Could not read marketplace readiness: ${error.message}`);
}

const products = data ?? [];
const variants = products.flatMap((product) =>
  (product.product_variants ?? []).map((variant) => ({
    ...variant,
    product_name: product.name,
    product_slug: product.slug,
    product_status: product.status,
  })),
);
const activeVariants = variants.filter((variant) => variant.is_active === true);
const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
const listings = products.flatMap((product) =>
  (product.marketplace_listings ?? []).map((listing) => ({
    ...listing,
    product_name: product.name,
    product_slug: product.slug,
  })),
);
const channelListings = (channel) =>
  listings.filter((listing) => listing.channel === channel);
const missingListings = (channel) =>
  channelListings(channel).filter((listing) => !listingReady(listing));
const readyListings = (channel) =>
  channelListings(channel).filter((listing) => listingReady(listing));

const report = {
  generatedAt: new Date().toISOString(),
  mode: "read_only_local_supabase_select",
  env: {
    supabase: envPresence(envKeys.supabase),
    stripe: envPresence(envKeys.stripe),
    amazon: envPresence(envKeys.amazon),
    tiktok: envPresence(envKeys.tiktok),
  },
  counts: {
    products: products.length,
    variants: variants.length,
    activeVariants: activeVariants.length,
    inventory: variants.reduce(
      (total, variant) => total + (variant.inventory_quantity ?? 0),
      0,
    ),
    marketplaceListings: listings.length,
    stripeConnectedActiveVariants: activeVariants.filter(
      (variant) => variant.stripe_product_id && variant.stripe_price_id,
    ).length,
    stripeMissingActiveVariants: activeVariants.filter(
      (variant) => !variant.stripe_product_id || !variant.stripe_price_id,
    ).length,
    amazonConnectedListings: readyListings("amazon").length,
    amazonMissingListings: missingListings("amazon").length,
    tiktokConnectedListings: readyListings("tiktok_shop").length,
    tiktokMissingListings: missingListings("tiktok_shop").length,
    needsReviewListings: listings.filter(
      (listing) => listing.sync_status === "needs_review",
    ).length,
  },
  missingStripeActiveVariants: activeVariants
    .filter((variant) => !variant.stripe_product_id || !variant.stripe_price_id)
    .map((variant) => ({
      product: variant.product_name,
      sku: variant.sku,
      missingProductId: !variant.stripe_product_id,
      missingPriceId: !variant.stripe_price_id,
    })),
  missingAmazonListings: missingListings("amazon").map((listing) =>
    listingLabel(listing, variantsById),
  ),
  missingTikTokListings: missingListings("tiktok_shop").map((listing) =>
    listingLabel(listing, variantsById),
  ),
  needsReviewListings: listings
    .filter((listing) => listing.sync_status === "needs_review")
    .map((listing) => listingLabel(listing, variantsById)),
};

console.log(JSON.stringify(report, null, 2));
