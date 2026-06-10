import "server-only";

import { getAdminProducts } from "@/lib/admin/data";
import type {
  MarketplaceListingRow,
  ProductVariantRow,
  ProductWithRelations,
} from "@/lib/products";
import { createTikTokReadOnlyClient } from "./client";
import type { TikTokConnectorResult, TikTokProductPreview } from "./types";

type TikTokProductsSearchResponse = {
  data?: {
    products?: TikTokProductApiItem[];
    total_count?: number;
  };
};

type TikTokProductApiItem = {
  id?: string;
  product_id?: string;
  title?: string;
  name?: string;
  status?: string;
  skus?: Array<{
    id?: string;
    sku_id?: string;
    seller_sku?: string;
    sellerSku?: string;
    inventory?: Array<{
      quantity?: number;
      available_quantity?: number;
    }>;
    stock_infos?: Array<{
      available_stock?: number;
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

function firstNumber(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function skuInventory(sku: NonNullable<TikTokProductApiItem["skus"]>[number]) {
  const inventoryQuantity = sku.inventory
    ?.map((item) => firstNumber(item.quantity, item.available_quantity))
    .filter((quantity): quantity is number => typeof quantity === "number")
    .reduce((total, quantity) => total + quantity, 0);

  if (typeof inventoryQuantity === "number") {
    return inventoryQuantity;
  }

  const stockQuantity = sku.stock_infos
    ?.map((item) => firstNumber(item.available_stock, item.quantity))
    .filter((quantity): quantity is number => typeof quantity === "number")
    .reduce((total, quantity) => total + quantity, 0);

  return typeof stockQuantity === "number" ? stockQuantity : null;
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

function matchTikTokProduct({
  productId,
  listingId,
  sellerSku,
  listings,
  variants,
}: {
  productId: string | null;
  listingId: string | null;
  sellerSku: string;
  listings: MarketplaceListingRow[];
  variants: VariantWithProduct[];
}) {
  const tiktokListings = listings.filter((listing) => listing.channel === "tiktok_shop");
  const listingByExternalSku = tiktokListings.find(
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

  const listingByExternalProductId = tiktokListings.find(
    (listing) =>
      productId && listing.external_product_id === productId && listing.variant_id,
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

  const listingByExternalListingId = tiktokListings.find(
    (listing) =>
      listingId && listing.external_listing_id === listingId && listing.variant_id,
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

export async function previewTikTokProductsImport(): Promise<
  TikTokConnectorResult<TikTokProductPreview[]>
> {
  const client = createTikTokReadOnlyClient();

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

  try {
    const payload = await client.data.request<TikTokProductsSearchResponse>(
      "/product/202309/products/search",
      {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
        }),
      },
    );
    const listings = marketplaceListings(productsResult.data);
    const variants = productVariants(productsResult.data);
    const previewRows = (payload.data?.products ?? []).flatMap((product) => {
      const productId = stringValue(product.id ?? product.product_id);
      const title = stringValue(product.title ?? product.name);

      return (product.skus ?? []).map((sku) => {
        const sellerSku = stringValue(sku.seller_sku ?? sku.sellerSku);
        const listingId = stringValue(sku.id ?? sku.sku_id);

        if (!sellerSku) {
          return null;
        }

        const match = matchTikTokProduct({
          productId,
          listingId,
          sellerSku,
          listings,
          variants,
        });

        const previewRow: TikTokProductPreview = {
          productId,
          listingId,
          sellerSku,
          title,
          status: stringValue(product.status),
          inventoryQuantity: skuInventory(sku),
          ...match,
        };

        return previewRow;
      });
    }).filter((item): item is TikTokProductPreview => Boolean(item));

    return {
      status: "ready_to_test",
      message: `TikTok Shop read-only product preview fetched ${previewRows.length} SKU rows.`,
      data: previewRows,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "TikTok Shop read-only product preview failed.",
      data: null,
    };
  }
}
