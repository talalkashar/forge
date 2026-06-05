import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/service-env";
import { hasAdminPassword } from "./auth";
import type {
  MarketplaceListingRow,
  ProductQueryResult,
  ProductVariantRow,
  ProductWithRelations,
} from "@/lib/products";

const ADMIN_PRODUCT_SELECT = `
  id,
  slug,
  name,
  subtitle,
  description,
  category,
  status,
  base_price_cents,
  currency,
  brand,
  is_featured,
  sort_order,
  created_at,
  updated_at,
  product_variants (
    id,
    product_id,
    sku,
    name,
    size,
    color,
    price_cents,
    inventory_quantity,
    stripe_price_id,
    stripe_product_id,
    is_active,
    created_at,
    updated_at
  ),
  product_images (
    id,
    product_id,
    variant_id,
    src,
    alt,
    position,
    is_primary
  ),
  marketplace_listings (
    id,
    product_id,
    variant_id,
    channel,
    external_product_id,
    external_listing_id,
    external_sku,
    listing_url,
    sync_status,
    last_synced_at,
    notes,
    created_at,
    updated_at
  )
`;

export type AdminSetupStatus = {
  hasPublicSupabaseEnv: boolean;
  hasServiceRole: boolean;
  hasAdminPassword: boolean;
  ready: boolean;
};

export type MarketplaceDashboardStats = {
  products: number;
  variants: number;
  listings: number;
  missingIds: number;
  missingStripeIds: number;
  missingAmazonIds: number;
  missingTikTokIds: number;
  needsReview: number;
  totalInventory: number;
};

export type SyncReadinessChannel = {
  channel: "website" | "stripe" | "amazon" | "tiktok_shop";
  label: string;
  ready: number;
  total: number;
  missing: number;
  needsReview: number;
  blockers: string[];
};

export type ProductSyncReadiness = {
  productId: string;
  productName: string;
  productSlug: string;
  websiteUrl: string | null;
  imageCount: number;
  variantCount: number;
  inventoryTotal: number;
  missingImages: number;
  missingSkus: number;
  missingStripeIds: number;
  missingAmazonIds: number;
  missingTikTokIds: number;
  inventoryWarnings: number;
  needsReview: number;
  blockers: string[];
};

export type SyncReadiness = {
  channels: SyncReadinessChannel[];
  products: ProductSyncReadiness[];
  nextActions: string[];
};

export type AdminMarketplaceListing = MarketplaceListingRow & {
  product_name: string;
  product_slug: string;
  variant_name: string | null;
  variant_sku: string | null;
};

export function getAdminSetupStatus(): AdminSetupStatus {
  const hasPublicSupabaseEnv = hasSupabaseEnv();
  const hasServiceRole = hasSupabaseServiceRoleEnv();
  const passwordConfigured = hasAdminPassword();

  return {
    hasPublicSupabaseEnv,
    hasServiceRole,
    hasAdminPassword: passwordConfigured,
    ready: hasPublicSupabaseEnv && hasServiceRole && passwordConfigured,
  };
}

function missingEnvResult<T>(data: T): ProductQueryResult<T> {
  return {
    data,
    error: null,
    missingEnv: true,
  };
}

function errorResult<T>(data: T, error: string): ProductQueryResult<T> {
  return {
    data,
    error,
    missingEnv: false,
  };
}

function adminClient() {
  return createSupabaseServiceRoleClient();
}

export async function getAdminProducts(): Promise<
  ProductQueryResult<ProductWithRelations[]>
> {
  if (!getAdminSetupStatus().ready) {
    return missingEnvResult([]);
  }

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return errorResult([], error.message);
  }

  return {
    data: (data ?? []) as ProductWithRelations[],
    error: null,
    missingEnv: false,
  };
}

export async function getAdminProductById(
  productId: string,
): Promise<ProductQueryResult<ProductWithRelations | null>> {
  if (!getAdminSetupStatus().ready) {
    return missingEnvResult(null);
  }

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    return errorResult(null, error.message);
  }

  return {
    data: (data as ProductWithRelations | null) ?? null,
    error: null,
    missingEnv: false,
  };
}

export async function getAdminMarketplaceListings(): Promise<
  ProductQueryResult<AdminMarketplaceListing[]>
> {
  const result = await getAdminProducts();

  if (result.error || result.missingEnv) {
    return {
      ...result,
      data: [],
    };
  }

  const listings = result.data.flatMap((product) => {
    const variants = new Map(
      (product.product_variants ?? []).map((variant) => [variant.id, variant]),
    );

    return (product.marketplace_listings ?? []).map((listing) => {
      const variant = listing.variant_id ? variants.get(listing.variant_id) : null;

      return {
        ...listing,
        product_name: product.name,
        product_slug: product.slug,
        variant_name: variant?.name ?? null,
        variant_sku: variant?.sku ?? null,
      };
    });
  });

  return {
    data: listings,
    error: null,
    missingEnv: false,
  };
}

export async function getMarketplaceDashboardStats(): Promise<
  ProductQueryResult<MarketplaceDashboardStats>
> {
  const productsResult = await getAdminProducts();
  const emptyStats = {
    products: 0,
    variants: 0,
    listings: 0,
    missingIds: 0,
    missingStripeIds: 0,
    missingAmazonIds: 0,
    missingTikTokIds: 0,
    needsReview: 0,
    totalInventory: 0,
  };

  if (productsResult.error || productsResult.missingEnv) {
    return {
      ...productsResult,
      data: emptyStats,
    };
  }

  const variants = productsResult.data.flatMap(
    (product) => product.product_variants ?? [],
  );
  const listings = productsResult.data.flatMap(
    (product) => product.marketplace_listings ?? [],
  );
  const missingMarketplaceIds = (channel: string) =>
    listings.filter(
      (listing) =>
        listing.channel === channel &&
        (!listing.external_product_id || !listing.external_listing_id),
    ).length;

  return {
    data: {
      products: productsResult.data.length,
      variants: variants.length,
      listings: listings.length,
      missingIds: listings.filter(
        (listing) =>
          listing.channel !== "website" &&
          (!listing.external_product_id || !listing.external_listing_id),
      ).length,
      missingStripeIds: variants.filter(
        (variant) => !variant.stripe_price_id || !variant.stripe_product_id,
      ).length,
      missingAmazonIds: missingMarketplaceIds("amazon"),
      missingTikTokIds: missingMarketplaceIds("tiktok_shop"),
      needsReview: listings.filter(
        (listing) => listing.sync_status === "needs_review",
      ).length,
      totalInventory: variants.reduce(
        (total, variant) => total + (variant.inventory_quantity ?? 0),
        0,
      ),
    },
    error: null,
    missingEnv: false,
  };
}

export async function getAdminVariants(): Promise<
  ProductQueryResult<Array<ProductVariantRow & { product_name: string }>>
> {
  const result = await getAdminProducts();

  if (result.error || result.missingEnv) {
    return {
      ...result,
      data: [],
    };
  }

  return {
    data: result.data.flatMap((product) =>
      (product.product_variants ?? []).map((variant) => ({
        ...variant,
        product_name: product.name,
      })),
    ),
    error: null,
    missingEnv: false,
  };
}

function listingReady(listing: MarketplaceListingRow | undefined) {
  return Boolean(
    listing?.external_product_id &&
      listing.external_listing_id &&
      listing.external_sku &&
      listing.sync_status !== "error",
  );
}

function listingNeedsReview(listing: MarketplaceListingRow | undefined) {
  return listing?.sync_status === "needs_review" || listing?.sync_status === "error";
}

export async function getMarketplaceSyncReadiness(): Promise<
  ProductQueryResult<SyncReadiness>
> {
  const productsResult = await getAdminProducts();
  const emptyReadiness: SyncReadiness = {
    channels: [],
    products: [],
    nextActions: [],
  };

  if (productsResult.error || productsResult.missingEnv) {
    return {
      ...productsResult,
      data: emptyReadiness,
    };
  }

  const products = productsResult.data;
  const allVariants = products.flatMap((product) => product.product_variants ?? []);
  const allListings = products.flatMap((product) => product.marketplace_listings ?? []);
  const channelListings = (channel: string) =>
    allListings.filter((listing) => listing.channel === channel);
  const marketplaceChannel = (
    channel: "amazon" | "tiktok_shop",
    label: string,
  ): SyncReadinessChannel => {
    const listings = channelListings(channel);
    const ready = listings.filter(listingReady).length;

    return {
      channel,
      label,
      ready,
      total: listings.length,
      missing: listings.length - ready,
      needsReview: listings.filter(listingNeedsReview).length,
      blockers:
        ready === listings.length
          ? []
          : [
              `Fill ${label} external product IDs, listing IDs, and SKUs in Marketplace.`,
              `Confirm ${label} listings are real before marking them connected.`,
            ],
    };
  };
  const stripeReady = allVariants.filter(
    (variant) => variant.stripe_product_id && variant.stripe_price_id,
  ).length;
  const websiteListings = channelListings("website");
  const websiteReady = products.filter((product) => {
    const listing = websiteListings.find((item) => item.product_id === product.id);
    return Boolean(
      listing?.listing_url &&
        (product.product_images ?? []).length > 0 &&
        (product.product_variants ?? []).length > 0,
    );
  }).length;
  const productRows = products.map((product) => {
    const variants = product.product_variants ?? [];
    const listings = product.marketplace_listings ?? [];
    const websiteListing = listings.find((listing) => listing.channel === "website");
    const amazonListings = listings.filter((listing) => listing.channel === "amazon");
    const tiktokListings = listings.filter((listing) => listing.channel === "tiktok_shop");
    const missingStripeIds = variants.filter(
      (variant) => !variant.stripe_price_id || !variant.stripe_product_id,
    ).length;
    const missingAmazonIds = amazonListings.filter((listing) => !listingReady(listing)).length;
    const missingTikTokIds = tiktokListings.filter((listing) => !listingReady(listing)).length;
    const needsReview = listings.filter(listingNeedsReview).length;
    const imageCount = product.product_images?.length ?? 0;
    const missingImages = imageCount === 0 ? 1 : 0;
    const missingSkus = variants.filter((variant) => !variant.sku).length;
    const inventoryWarnings = variants.filter(
      (variant) => (variant.inventory_quantity ?? 0) <= 0,
    ).length;
    const inventoryTotal = variants.reduce(
      (total, variant) => total + (variant.inventory_quantity ?? 0),
      0,
    );
    const blockers = [
      !websiteListing?.listing_url ? "Missing website listing URL." : null,
      missingImages > 0 ? "No product images mapped." : null,
      variants.length === 0 ? "No variants/SKUs configured." : null,
      missingSkus > 0 ? `${missingSkus} variants missing SKUs.` : null,
      missingStripeIds > 0 ? `${missingStripeIds} variants missing Stripe IDs.` : null,
      missingAmazonIds > 0 ? `${missingAmazonIds} Amazon listings missing IDs.` : null,
      missingTikTokIds > 0 ? `${missingTikTokIds} TikTok Shop listings missing IDs.` : null,
      needsReview > 0 ? `${needsReview} marketplace listings need review.` : null,
      inventoryWarnings > 0 ? `${inventoryWarnings} variants have zero inventory.` : null,
    ].filter((blocker): blocker is string => Boolean(blocker));

    return {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      websiteUrl: websiteListing?.listing_url ?? null,
      imageCount,
      variantCount: variants.length,
      inventoryTotal,
      missingImages,
      missingSkus,
      missingStripeIds,
      missingAmazonIds,
      missingTikTokIds,
      inventoryWarnings,
      needsReview,
      blockers,
    };
  });
  const channels: SyncReadinessChannel[] = [
    {
      channel: "website",
      label: "Website",
      ready: websiteReady,
      total: products.length,
      missing: products.length - websiteReady,
      needsReview: websiteListings.filter(listingNeedsReview).length,
      blockers:
        websiteReady === products.length
          ? []
          : ["Each live product needs a website URL, image, and active variant."],
    },
    {
      channel: "stripe",
      label: "Stripe",
      ready: stripeReady,
      total: allVariants.length,
      missing: allVariants.length - stripeReady,
      needsReview: channelListings("stripe").filter(listingNeedsReview).length,
      blockers:
        stripeReady === allVariants.length
          ? []
          : ["Add Stripe Product IDs and Price IDs for every variant."],
    },
    marketplaceChannel("amazon", "Amazon"),
    marketplaceChannel("tiktok_shop", "TikTok Shop"),
  ];
  const nextActions = [
    channels.find((channel) => channel.channel === "stripe" && channel.missing > 0)
      ? "Create/fill Stripe Product IDs and Price IDs for all variants."
      : null,
    channels.find((channel) => channel.channel === "amazon" && channel.missing > 0)
      ? "Fill real Amazon listing IDs and SKUs; do not use guessed identifiers."
      : null,
    channels.find((channel) => channel.channel === "tiktok_shop" && channel.missing > 0)
      ? "Fill real TikTok Shop product/listing IDs after listings exist."
      : null,
    "Keep using inventory snapshots before any seed/reset work.",
    "Build Amazon/TikTok API connectors in dry-run mode before enabling writes.",
  ].filter((action): action is string => Boolean(action));

  return {
    data: {
      channels,
      products: productRows,
      nextActions,
    },
    error: null,
    missingEnv: false,
  };
}
