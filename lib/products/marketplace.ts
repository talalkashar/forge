import "server-only";

import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import {
  getSupabaseServiceRoleEnv,
  hasSupabaseServiceRoleEnv,
} from "@/lib/supabase/service-env";
import type {
  InventorySyncPreparation,
  MarketplaceChannel,
  MarketplaceListingRow,
  MarketplaceMapping,
  MarketplaceSyncStatus,
  ProductImageRow,
  ProductQueryResult,
  ProductRow,
  ProductVariantRow,
  ProductWithRelations,
} from "./types";

const PRODUCT_SELECT = `
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
  )
`;

const PRODUCT_COLUMNS =
  "id, slug, name, subtitle, description, category, status, base_price_cents, currency, brand, is_featured, sort_order, created_at, updated_at";

/**
 * Catalog query budget. Keep snappy, but long enough for nested variant/image
 * payloads so we don't silently fall back to offline catalog and fake stock.
 */
const CATALOG_QUERY_TIMEOUT_MS = 3000;

/** Short cooldown after timeouts — prefer retrying live inventory quickly. */
const CATALOG_COOLDOWN_MS = 30_000;
const CATALOG_COOLDOWN_FILE = "/tmp/forge-catalog-cooldown";

function catalogIsInCooldown() {
  try {
    const raw = readFileSync(CATALOG_COOLDOWN_FILE, "utf8");
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function markCatalogCooldown() {
  try {
    writeFileSync(
      CATALOG_COOLDOWN_FILE,
      String(Date.now() + CATALOG_COOLDOWN_MS),
      "utf8",
    );
  } catch {
    // Ignore filesystem issues; timeout path still returns fallback data.
  }
}

function emptyResult<T>(data: T): ProductQueryResult<T> {
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

async function withTimeout<T>(
  promise: PromiseLike<T>,
  label: string,
  timeoutMs = CATALOG_QUERY_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(
              `${label} timed out after ${timeoutMs}ms (Supabase unreachable or slow)`,
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function createCatalogClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Browser/Node fetch abort if the remote never answers.
          signal: AbortSignal.timeout(CATALOG_QUERY_TIMEOUT_MS),
        }),
    },
  });
}

async function createMarketplaceClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceRoleEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function sortImages(images: ProductImageRow[] = []) {
  return [...images].sort((left, right) => {
    if (left.is_primary && !right.is_primary) {
      return -1;
    }

    if (!left.is_primary && right.is_primary) {
      return 1;
    }

    return (left.position ?? 0) - (right.position ?? 0);
  });
}

export function sortVariants(variants: ProductVariantRow[] = []) {
  const sizeOrder = new Map([
    ["XS", 0],
    ["S", 1],
    ["M", 2],
    ["L", 3],
    ["XL", 4],
    ["XXL", 5],
  ]);

  return [...variants].sort((left, right) => {
    const leftIndex = sizeOrder.get((left.size ?? "").toUpperCase()) ?? 99;
    const rightIndex = sizeOrder.get((right.size ?? "").toUpperCase()) ?? 99;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.sku.localeCompare(right.sku);
  });
}

function isActiveProduct(product: ProductRow) {
  return product.status === "active";
}

function channelListing(
  listings: MarketplaceListingRow[],
  channel: MarketplaceChannel,
  variantId: string | null,
) {
  return (
    listings.find(
      (listing) => listing.channel === channel && listing.variant_id === variantId,
    ) ??
    listings.find(
      (listing) => listing.channel === channel && listing.variant_id === null,
    ) ??
    null
  );
}

function listingPayload(listing: MarketplaceListingRow | null) {
  return {
    productId: listing?.external_product_id ?? null,
    listingId: listing?.external_listing_id ?? null,
    sku: listing?.external_sku ?? null,
    listingUrl: listing?.listing_url ?? null,
    syncStatus: listing?.sync_status ?? "not_connected",
  };
}

export async function getProducts(): Promise<
  ProductQueryResult<ProductWithRelations[]>
> {
  if (!hasSupabaseEnv()) {
    return emptyResult([]);
  }

  if (catalogIsInCooldown()) {
    return errorResult([], "Catalog cooldown active after recent Supabase timeout");
  }

  try {
    const supabase = await createCatalogClient();
    const { data, error } = await withTimeout(
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      "getProducts",
    );

    if (error) {
      markCatalogCooldown();
      return errorResult([], error.message);
    }

    return {
      data: (data ?? []) as ProductWithRelations[],
      error: null,
      missingEnv: false,
    };
  } catch (error) {
    markCatalogCooldown();
    return errorResult(
      [],
      error instanceof Error ? error.message : "Failed to load products",
    );
  }
}

export async function getFeaturedProducts(): Promise<
  ProductQueryResult<ProductWithRelations[]>
> {
  const result = await getProducts();

  return {
    ...result,
    data: result.data.filter((product) => product.is_featured),
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductQueryResult<ProductWithRelations | null>> {
  if (!hasSupabaseEnv()) {
    return emptyResult(null);
  }

  if (catalogIsInCooldown()) {
    return errorResult(
      null,
      "Catalog cooldown active after recent Supabase timeout",
    );
  }

  try {
    const supabase = await createCatalogClient();
    const { data, error } = await withTimeout(
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle(),
      `getProductBySlug(${slug})`,
    );

    if (error) {
      markCatalogCooldown();
      return errorResult(null, error.message);
    }

    return {
      data: (data as ProductWithRelations | null) ?? null,
      error: null,
      missingEnv: false,
    };
  } catch (error) {
    markCatalogCooldown();
    return errorResult(
      null,
      error instanceof Error ? error.message : "Failed to load product",
    );
  }
}

export async function getProductVariants(
  productId: string,
): Promise<ProductQueryResult<ProductVariantRow[]>> {
  if (!hasSupabaseEnv()) {
    return emptyResult([]);
  }

  const supabase = await createCatalogClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("sku", { ascending: true });

  if (error) {
    return errorResult([], error.message);
  }

  return {
    data: sortVariants((data ?? []) as ProductVariantRow[]),
    error: null,
    missingEnv: false,
  };
}

export async function getMarketplaceListings(
  productId: string,
): Promise<ProductQueryResult<MarketplaceListingRow[]>> {
  if (!hasSupabaseServiceRoleEnv()) {
    return emptyResult([]);
  }

  const supabase = await createMarketplaceClient();
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("product_id", productId)
    .order("channel", { ascending: true });

  if (error) {
    return errorResult([], error.message);
  }

  return {
    data: (data ?? []) as MarketplaceListingRow[],
    error: null,
    missingEnv: false,
  };
}

export function formatMarketplaceMapping(
  product: ProductWithRelations,
): MarketplaceMapping {
  const variants = sortVariants(product.product_variants ?? []);
  const listings = product.marketplace_listings ?? [];

  return {
    website: {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      status: product.status,
      priceCents: product.base_price_cents,
      currency: product.currency,
    },
    variants: variants.map((variant) => ({
      variantId: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      inventoryQuantity: variant.inventory_quantity ?? 0,
      stripe: {
        variantId: variant.id,
        sku: variant.sku,
        stripePriceId: variant.stripe_price_id,
        stripeProductId: variant.stripe_product_id,
        priceCents: variant.price_cents ?? product.base_price_cents,
        currency: product.currency,
      },
      amazon: listingPayload(channelListing(listings, "amazon", variant.id)),
      tiktokShop: listingPayload(channelListing(listings, "tiktok_shop", variant.id)),
    })),
  };
}

export function prepareInventorySync(
  product: ProductWithRelations,
): InventorySyncPreparation[] {
  const listings = product.marketplace_listings ?? [];

  return sortVariants(product.product_variants ?? []).map((variant) => {
    const channels: MarketplaceChannel[] = ["website", "stripe"];

    if (channelListing(listings, "amazon", variant.id)) {
      channels.push("amazon");
    }

    if (channelListing(listings, "tiktok_shop", variant.id)) {
      channels.push("tiktok_shop");
    }

    return {
      variantId: variant.id,
      sku: variant.sku,
      inventoryQuantity: variant.inventory_quantity ?? 0,
      active: Boolean(variant.is_active && isActiveProduct(product)),
      channels,
    };
  });
}

export async function getProductRows(): Promise<ProductQueryResult<ProductRow[]>> {
  if (!hasSupabaseEnv()) {
    return emptyResult([]);
  }

  const supabase = await createCatalogClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (error) {
    return errorResult([], error.message);
  }

  return {
    data: (data ?? []) as ProductRow[],
    error: null,
    missingEnv: false,
  };
}

export type {
  InventorySyncPreparation,
  MarketplaceChannel,
  MarketplaceListingRow,
  MarketplaceMapping,
  MarketplaceSyncStatus,
  ProductImageRow,
  ProductQueryResult,
  ProductRow,
  ProductVariantRow,
  ProductWithRelations,
};
