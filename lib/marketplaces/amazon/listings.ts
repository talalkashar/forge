import "server-only";

import { getAdminProducts } from "@/lib/admin/data";
import type {
  MarketplaceListingRow,
  ProductVariantRow,
  ProductWithRelations,
} from "@/lib/products";
import { createAmazonReadOnlyClient } from "./client";
import type { AmazonConnectorResult, AmazonListingPreview } from "./types";

type AmazonListingsItemsResponse = {
  items?: Array<{
    sku?: string;
    summaries?: Array<{
      asin?: string;
      itemName?: string;
      status?: string[] | string;
    }>;
    fulfillmentAvailability?: Array<{
      fulfillmentChannelCode?: string;
      quantity?: number;
    }>;
  }>;
};

type VariantWithProduct = ProductVariantRow & {
  product_name: string;
};

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function firstSummary(item: NonNullable<AmazonListingsItemsResponse["items"]>[number]) {
  return item.summaries?.[0] ?? null;
}

function itemStatus(status: string[] | string | undefined) {
  if (Array.isArray(status)) {
    return status.join(", ") || null;
  }

  return stringValue(status);
}

function itemQuantity(item: NonNullable<AmazonListingsItemsResponse["items"]>[number]) {
  const quantities = item.fulfillmentAvailability
    ?.map((availability) => availability.quantity)
    .filter((quantity): quantity is number => typeof quantity === "number");

  if (!quantities || quantities.length === 0) {
    return null;
  }

  return quantities.reduce((total, quantity) => total + quantity, 0);
}

function marketplaceListings(products: ProductWithRelations[]) {
  return products.flatMap((product) => product.marketplace_listings ?? []);
}

function productVariants(products: ProductWithRelations[]) {
  return products.flatMap((product) =>
    (product.product_variants ?? []).map((variant) => ({
      ...variant,
      product_name: product.name,
    })),
  );
}

function matchAmazonListing({
  asin,
  sellerSku,
  externalListingId,
  listings,
  variants,
}: {
  asin: string | null;
  sellerSku: string;
  externalListingId: string | null;
  listings: MarketplaceListingRow[];
  variants: VariantWithProduct[];
}) {
  const amazonListings = listings.filter((listing) => listing.channel === "amazon");
  const listingByExternalSku = amazonListings.find(
    (listing) => listing.external_sku === sellerSku && listing.variant_id,
  );

  if (listingByExternalSku) {
    const variant = variants.find((item) => item.id === listingByExternalSku.variant_id);

    return {
      matchedVariantId: listingByExternalSku.variant_id,
      matchedSku: variant?.sku ?? listingByExternalSku.external_sku,
      matchedProductName: variant?.product_name ?? null,
      matchReason: "external_sku" as const,
    };
  }

  const variantBySku = variants.find((variant) => variant.sku === sellerSku);

  if (variantBySku) {
    return {
      matchedVariantId: variantBySku.id,
      matchedSku: variantBySku.sku,
      matchedProductName: variantBySku.product_name,
      matchReason: "variant_sku" as const,
    };
  }

  const listingByExternalProductId = amazonListings.find(
    (listing) => asin && listing.external_product_id === asin && listing.variant_id,
  );

  if (listingByExternalProductId) {
    const variant = variants.find((item) => item.id === listingByExternalProductId.variant_id);

    return {
      matchedVariantId: listingByExternalProductId.variant_id,
      matchedSku: variant?.sku ?? listingByExternalProductId.external_sku,
      matchedProductName: variant?.product_name ?? null,
      matchReason: "external_product_id" as const,
    };
  }

  const listingByExternalListingId = amazonListings.find(
    (listing) =>
      externalListingId &&
      listing.external_listing_id === externalListingId &&
      listing.variant_id,
  );

  if (listingByExternalListingId) {
    const variant = variants.find((item) => item.id === listingByExternalListingId.variant_id);

    return {
      matchedVariantId: listingByExternalListingId.variant_id,
      matchedSku: variant?.sku ?? listingByExternalListingId.external_sku,
      matchedProductName: variant?.product_name ?? null,
      matchReason: "external_listing_id" as const,
    };
  }

  return {
    matchedVariantId: null,
    matchedSku: null,
    matchedProductName: null,
    matchReason: "manual_review" as const,
  };
}

export async function previewAmazonListingsImport(): Promise<
  AmazonConnectorResult<AmazonListingPreview[]>
> {
  const client = createAmazonReadOnlyClient();

  if (client.status !== "ready_to_test") {
    return client;
  }

  const productsResult = await getAdminProducts();

  if (productsResult.error || productsResult.missingEnv) {
    return {
      status: "error",
      message: productsResult.error ?? "Supabase admin catalog is not configured.",
      data: null,
    };
  }

  const searchParams = new URLSearchParams({
    marketplaceIds: client.data.marketplaceId,
    includedData: "summaries,fulfillmentAvailability",
  });

  try {
    const payload = await client.data.request<AmazonListingsItemsResponse>(
      `/listings/2021-08-01/items/${encodeURIComponent(client.data.sellerId)}?${searchParams.toString()}`,
    );
    const listings = marketplaceListings(productsResult.data);
    const variants = productVariants(productsResult.data);
    const previewRows = (payload.items ?? [])
      .map((item) => {
        const sellerSku = stringValue(item.sku);

        if (!sellerSku) {
          return null;
        }

        const summary = firstSummary(item);
        const asin = stringValue(summary?.asin);
        const externalListingId = sellerSku;
        const match = matchAmazonListing({
          asin,
          sellerSku,
          externalListingId,
          listings,
          variants,
        });

        const previewRow: AmazonListingPreview = {
          sellerSku,
          asin,
          externalListingId,
          title: stringValue(summary?.itemName),
          status: itemStatus(summary?.status),
          rawMarketplaceId: client.data.marketplaceId,
          inventoryQuantity: itemQuantity(item),
          ...match,
        };

        return previewRow;
      })
      .filter((item): item is AmazonListingPreview => item !== null);

    return {
      status: "ready_to_test",
      message: `Amazon read-only listings preview fetched ${previewRows.length} rows.`,
      data: previewRows,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Amazon read-only listings preview failed.",
      data: null,
    };
  }
}
