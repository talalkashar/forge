import "server-only";

import Stripe from "stripe";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  MarketplaceListingRow,
  ProductQueryResult,
  ProductVariantRow,
  ProductWithRelations,
} from "@/lib/products";
import { getAdminProducts } from "./data";

export type StripeSetupStatus = "ready" | "missing" | "needs_setup";

export type StripeSetupVariant = {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceCents: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  stripeListingId: string | null;
  marketplaceSyncStatus: string | null;
  status: StripeSetupStatus;
  plannedStripeProductName: string;
  plannedStripePriceAmount: number;
  plannedActions: string[];
};

export type StripeSetupPlan = {
  variants: StripeSetupVariant[];
  readyCount: number;
  missingCount: number;
  needsSetupCount: number;
  stripeSecretConfigured: boolean;
};

type StripeSetupResult = {
  processed: number;
  productsCreated: number;
  productsReused: number;
  pricesCreated: number;
  pricesReused: number;
};

function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY;
}

export function hasStripeSecretKey() {
  return Boolean(stripeSecretKey());
}

function stripeClient() {
  const key = stripeSecretKey();

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(key);
}

function activeVariants(product: ProductWithRelations) {
  return (product.product_variants ?? []).filter(
    (variant) => variant.is_active === true,
  );
}

function stripeListingForVariant(product: ProductWithRelations, variantId: string) {
  return (product.marketplace_listings ?? []).find(
    (listing) => listing.channel === "stripe" && listing.variant_id === variantId,
  );
}

function plannedStripeProductName(product: ProductWithRelations, variant: ProductVariantRow) {
  const details = [variant.size, variant.color].filter(Boolean).join(" / ");

  return details ? `${product.name} - ${details}` : variant.name || product.name;
}

function statusForVariant(
  variant: ProductVariantRow,
  listing?: MarketplaceListingRow,
): StripeSetupStatus {
  if (variant.stripe_product_id && variant.stripe_price_id) {
    return "ready";
  }

  if (
    variant.stripe_product_id ||
    variant.stripe_price_id ||
    listing?.external_product_id ||
    listing?.external_listing_id
  ) {
    return "needs_setup";
  }

  return "missing";
}

function plannedActionsForVariant(
  variant: ProductVariantRow,
  listing: MarketplaceListingRow | undefined,
) {
  const actions: string[] = [];

  if (!variant.stripe_product_id && !listing?.external_product_id) {
    actions.push("Create or reuse Stripe Product");
  }

  if (!variant.stripe_price_id && !listing?.external_listing_id) {
    actions.push("Create or reuse Stripe Price");
  }

  if (actions.length > 0) {
    actions.push("Save Stripe IDs to Supabase");
    actions.push("Mark Stripe marketplace listing connected");
  }

  return actions;
}

export async function getStripeSetupPlan(): Promise<ProductQueryResult<StripeSetupPlan>> {
  const productsResult = await getAdminProducts();
  const emptyPlan: StripeSetupPlan = {
    variants: [],
    readyCount: 0,
    missingCount: 0,
    needsSetupCount: 0,
    stripeSecretConfigured: hasStripeSecretKey(),
  };

  if (productsResult.error || productsResult.missingEnv) {
    return {
      ...productsResult,
      data: emptyPlan,
    };
  }

  const variants = productsResult.data
    .filter((product) => product.status === "active")
    .flatMap((product) =>
      activeVariants(product).map((variant) => {
        const listing = stripeListingForVariant(product, variant.id);
        const priceCents = variant.price_cents ?? product.base_price_cents;
        const currency = (product.currency || "USD").toLowerCase();
        const status = statusForVariant(variant, listing);

        return {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          priceCents,
          currency,
          stripeProductId: variant.stripe_product_id ?? listing?.external_product_id ?? null,
          stripePriceId: variant.stripe_price_id ?? listing?.external_listing_id ?? null,
          stripeListingId: listing?.id ?? null,
          marketplaceSyncStatus: listing?.sync_status ?? null,
          status,
          plannedStripeProductName: plannedStripeProductName(product, variant),
          plannedStripePriceAmount: priceCents,
          plannedActions: plannedActionsForVariant(variant, listing),
        };
      }),
    );

  return {
    data: {
      variants,
      readyCount: variants.filter((variant) => variant.status === "ready").length,
      missingCount: variants.filter((variant) => variant.status === "missing").length,
      needsSetupCount: variants.filter((variant) => variant.status === "needs_setup").length,
      stripeSecretConfigured: hasStripeSecretKey(),
    },
    error: null,
    missingEnv: false,
  };
}

function searchValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function findReusableStripeProduct(
  stripe: Stripe,
  variant: StripeSetupVariant,
) {
  const byVariant = await stripe.products.search({
    query: `metadata['forge_variant_id']:'${searchValue(variant.variantId)}'`,
    limit: 1,
  });

  if (byVariant.data[0]) {
    return byVariant.data[0];
  }

  const bySku = await stripe.products.search({
    query: `metadata['forge_sku']:'${searchValue(variant.sku)}'`,
    limit: 1,
  });

  return bySku.data[0] ?? null;
}

async function findReusableStripePrice(
  stripe: Stripe,
  variant: StripeSetupVariant,
  stripeProductId: string,
) {
  const prices = await stripe.prices.search({
    query: `metadata['forge_variant_id']:'${searchValue(variant.variantId)}' AND active:'true'`,
    limit: 10,
  });

  return (
    prices.data.find(
      (price) =>
        price.product === stripeProductId &&
        price.unit_amount === variant.priceCents &&
        price.currency === variant.currency,
    ) ?? null
  );
}

function stripeMetadata(variant: StripeSetupVariant) {
  return {
    forge_product_id: variant.productId,
    forge_product_slug: variant.productSlug,
    forge_variant_id: variant.variantId,
    forge_sku: variant.sku,
    forge_size: variant.size ?? "",
    forge_color: variant.color ?? "",
  };
}

async function ensureStripeProduct(stripe: Stripe, variant: StripeSetupVariant) {
  if (variant.stripeProductId) {
    return {
      id: variant.stripeProductId,
      reused: true,
      created: false,
    };
  }

  const reusable = await findReusableStripeProduct(stripe, variant);

  if (reusable) {
    return {
      id: reusable.id,
      reused: true,
      created: false,
    };
  }

  const product = await stripe.products.create(
    {
      name: variant.plannedStripeProductName,
      active: true,
      metadata: stripeMetadata(variant),
    },
    {
      idempotencyKey: `forge-stripe-product-${variant.variantId}`,
    },
  );

  return {
    id: product.id,
    reused: false,
    created: true,
  };
}

async function ensureStripePrice(
  stripe: Stripe,
  variant: StripeSetupVariant,
  stripeProductId: string,
) {
  if (variant.stripePriceId) {
    return {
      id: variant.stripePriceId,
      reused: true,
      created: false,
    };
  }

  const reusable = await findReusableStripePrice(stripe, variant, stripeProductId);

  if (reusable) {
    return {
      id: reusable.id,
      reused: true,
      created: false,
    };
  }

  const price = await stripe.prices.create(
    {
      product: stripeProductId,
      unit_amount: variant.priceCents,
      currency: variant.currency,
      metadata: stripeMetadata(variant),
    },
    {
      idempotencyKey: `forge-stripe-price-${variant.variantId}-${variant.currency}-${variant.priceCents}`,
    },
  );

  return {
    id: price.id,
    reused: false,
    created: true,
  };
}

export async function createMissingStripeMappings(): Promise<StripeSetupResult> {
  const planResult = await getStripeSetupPlan();

  if (planResult.error) {
    throw new Error(planResult.error);
  }

  const stripe = stripeClient();
  const supabase = createSupabaseServiceRoleClient();
  const result: StripeSetupResult = {
    processed: 0,
    productsCreated: 0,
    productsReused: 0,
    pricesCreated: 0,
    pricesReused: 0,
  };

  for (const variant of planResult.data.variants) {
    if (variant.status === "ready") {
      continue;
    }

    const stripeProduct = await ensureStripeProduct(stripe, variant);
    const stripePrice = await ensureStripePrice(stripe, variant, stripeProduct.id);

    result.processed += 1;
    result.productsCreated += stripeProduct.created ? 1 : 0;
    result.productsReused += stripeProduct.reused ? 1 : 0;
    result.pricesCreated += stripePrice.created ? 1 : 0;
    result.pricesReused += stripePrice.reused ? 1 : 0;

    const { error: variantError } = await supabase
      .from("product_variants")
      .update({
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
      })
      .eq("id", variant.variantId);

    if (variantError) {
      throw new Error(variantError.message);
    }

    const listingPayload = {
      product_id: variant.productId,
      variant_id: variant.variantId,
      channel: "stripe",
      external_product_id: stripeProduct.id,
      external_listing_id: stripePrice.id,
      external_sku: variant.sku,
      listing_url: null,
      sync_status: "connected",
      last_synced_at: new Date().toISOString(),
      notes: "created/reused by admin stripe setup",
    };

    if (variant.stripeListingId) {
      const { error: listingError } = await supabase
        .from("marketplace_listings")
        .update(listingPayload)
        .eq("id", variant.stripeListingId);

      if (listingError) {
        throw new Error(listingError.message);
      }
    } else {
      const { error: listingError } = await supabase
        .from("marketplace_listings")
        .insert(listingPayload);

      if (listingError) {
        throw new Error(listingError.message);
      }
    }
  }

  return result;
}
