import "server-only";

import { readFileSync } from "fs";
import {
  beltVariantOrder,
  featuredProductOrder,
  productPresentationBySlug,
  type ProductCatalogItem,
  type ProductDetailConfig,
  type ProductPresentation,
} from "@/app/components/product/productData";
import {
  centsToDollars,
  formatMarketplaceMapping,
  getFeaturedProducts,
  getMarketplaceListings,
  getProductBySlug,
  getProducts,
  getProductVariants,
  prepareInventorySync,
  sortImages,
  sortVariants,
  titleCase,
} from "@/lib/products/marketplace";
import type {
  MarketplaceListingRow,
  MarketplaceMapping,
  ProductQueryResult,
  ProductVariantRow,
  ProductWithRelations,
} from "@/lib/products/marketplace";

export type StorefrontProduct = ProductCatalogItem &
  ProductDetailConfig & {
    brand: string;
    subtitle: string | null;
    status: string;
    databaseCategory: string;
    catalogCategory: "belts" | "straps" | "other";
    basePriceCents: number;
    currency: string;
    isFeatured: boolean;
    sortOrder: number;
    variants: ProductVariantRow[];
    availableSkus: string[];
    availableSizes: string[];
    inventoryQuantity: number;
    marketplaceListings: MarketplaceListingRow[];
    marketplaceMapping: MarketplaceMapping;
    descriptionText: string;
  };

function fallbackProductFromPresentation(
  presentation: ProductPresentation,
): StorefrontProduct {
  const isBelt = beltVariantOrder.includes(
    presentation.slug as (typeof beltVariantOrder)[number],
  );
  const basePriceCents = isBelt ? 7997 : 999;
  const sizes = isBelt ? ["S", "M", "L", "XL"] : [];
  // Offline presentation-only catalog. Never invent sellable stock —
  // live quantities come only from Supabase product_variants.
  const offlineStock = 0;
  const variants: ProductVariantRow[] =
    sizes.length > 0
      ? sizes.map((size) => ({
          id: `${presentation.slug}-${size.toLowerCase()}`,
          product_id: presentation.slug,
          sku: `FORGE-${presentation.slug.toUpperCase()}-BELT-${size}`,
          name: `${presentation.categoryLabel} - ${size}`,
          size,
          color: presentation.slug === "black" ? "Black" : titleCase(presentation.slug),
          price_cents: basePriceCents,
          inventory_quantity: offlineStock,
          stripe_price_id: null,
          stripe_product_id: null,
          is_active: false,
          created_at: null,
          updated_at: null,
        }))
      : [
          {
            id: `${presentation.slug}-black`,
            product_id: presentation.slug,
            sku: "FORGE-STRAPS-BLACK",
            name: presentation.categoryLabel,
            size: null,
            color: "Black",
            price_cents: basePriceCents,
            inventory_quantity: offlineStock,
            stripe_price_id: null,
            stripe_product_id: null,
            is_active: false,
            created_at: null,
            updated_at: null,
          },
        ];

  const product: ProductWithRelations = {
    id: presentation.slug,
    slug: presentation.slug,
    name:
      presentation.slug === "straps"
        ? "FORGE Lifting Straps"
        : `${titleCase(presentation.slug)} Lever Belt`,
    subtitle: null,
    description: presentation.description,
    category: isBelt ? "belt" : "accessories",
    status: "active",
    base_price_cents: basePriceCents,
    currency: "USD",
    brand: "FORGE GYM",
    is_featured: featuredProductOrder.includes(
      presentation.slug as (typeof featuredProductOrder)[number],
    ),
    sort_order: featuredProductOrder.indexOf(
      presentation.slug as (typeof featuredProductOrder)[number],
    ),
    created_at: null,
    updated_at: null,
    product_variants: variants,
    product_images: presentation.images.map((src, index) => ({
      id: `${presentation.slug}-image-${index}`,
      product_id: presentation.slug,
      variant_id: null,
      src,
      alt: presentation.imageAlts?.[index] ?? presentation.description,
      position: index,
      is_primary: index === 0,
    })),
    marketplace_listings: [],
  };

  return createStorefrontProduct(product);
}

function getFallbackStorefrontProducts() {
  return sortStorefrontProducts(
    Object.values(productPresentationBySlug).map(fallbackProductFromPresentation),
  );
}

function sortStorefrontProducts(products: StorefrontProduct[]) {
  const featuredIndex = new Map<string, number>(
    featuredProductOrder.map((slug, index) => [slug, index]),
  );

  return [...products].sort((left, right) => {
    const leftIndex = featuredIndex.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = featuredIndex.get(right.slug) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name);
  });
}

function getCatalogCategory(product: ProductWithRelations) {
  const category = product.category.toLowerCase();
  const slug = product.slug.toLowerCase();
  const name = product.name.toLowerCase();

  if (category.includes("belt")) {
    return "belts";
  }

  if (
    category.includes("strap") ||
    category.includes("accessor") ||
    slug.includes("strap") ||
    name.includes("strap")
  ) {
    return "straps";
  }

  return "other";
}

function firstActiveVariant(product: ProductWithRelations) {
  return sortVariants(product.product_variants ?? []).find((variant) => variant.is_active);
}


/**
 * Reject uncurated gallery noise from storefront product carousels.
 * Allow TikTok-style listing packs: main/card + numbered slides 1–7
 * (hero product shot + red/black branded infographics).
 */
function isMarketingSlide(src: string): boolean {
  if (!src.includes("/images/")) return true;
  if (src.includes("/listing/")) {
    const base = src.split("/").pop() || "";
    // Explicit packshot / hero names
    if (
      base === "main.jpg" ||
      base === "card.jpg" ||
      base === "1-removebg.png" ||
      base === "1-removebg.webp"
    ) {
      return false;
    }
    // Numbered TikTok-style gallery slides: 1.jpg … 7.jpg (and .png/.webp)
    if (/^[1-7]\.(jpe?g|png|webp)$/i.test(base)) {
      return false;
    }
    // Cache-busted curated gallery packs from productData (gallery-v2-1.jpg, etc.)
    if (/^gallery-v\d+-\d+\.(jpe?g|png|webp)$/i.test(base)) {
      return false;
    }
    // Everything else under listing/ is leftover spam (01.jpg, product-white, etc.)
    return true;
  }
  // Description marketing art never as product gallery from DB
  if (src.toLowerCase().includes("product description")) return true;
  if (src.toLowerCase().includes("size-chart")) return true;
  // lifestyle paths only if presentation explicitly includes them
  if (src.includes("/lifestyle/")) return true;
  if (src.includes("life-")) return true;
  return false;
}


function createStorefrontProduct(product: ProductWithRelations): StorefrontProduct {
  const presentation = productPresentationBySlug[product.slug];
  const variants = sortVariants(product.product_variants ?? []);
  const activeVariants = variants.filter((variant) => variant.is_active);
  const representativeVariant = firstActiveVariant(product);
  const sortedImages = sortImages(product.product_images ?? []);
  const imageSources = sortedImages.map((image) => image.src);
  // Prefer curated presentation order when available (product shots → lifestyle).
  // Append any DB-only images that presentation does not already include.
  // Curated presentation galleries only — never append raw DB listing spam
  // (webp/marketing/white-bg/legacy 1-7 Amazon slides).
  const presentationImages = (presentation?.images ?? []).filter(
    (src) => !isMarketingSlide(src),
  );
  const images =
    presentationImages.length > 0
      ? presentationImages
      : imageSources.filter((src) => !isMarketingSlide(src));
  const getPresentationImageAlt = (src: string) => {
    const presentationIndex = presentation?.images.indexOf(src) ?? -1;

    return (
      presentation?.imageAlts?.[presentationIndex] ??
      presentation?.description ??
      `${product.name} lifestyle image`
    );
  };
  const priceCents = representativeVariant?.price_cents ?? product.base_price_cents;
  const categoryLabel = presentation?.categoryLabel ?? titleCase(product.category);
  const descriptionText = product.description?.trim() ?? "";

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand ?? "FORGE GYM",
    subtitle: product.subtitle,
    status: product.status,
    databaseCategory: product.category,
    catalogCategory: getCatalogCategory(product),
    basePriceCents: product.base_price_cents,
    currency: product.currency,
    isFeatured: product.is_featured ?? false,
    sortOrder: product.sort_order ?? 0,
    variants,
    availableSkus: activeVariants.map((variant) => variant.sku),
    availableSizes: activeVariants
      .map((variant) => variant.size)
      .filter((size): size is string => Boolean(size)),
    inventoryQuantity: activeVariants.reduce(
      (total, variant) => total + (variant.inventory_quantity ?? 0),
      0,
    ),
    marketplaceListings: product.marketplace_listings ?? [],
    marketplaceMapping: formatMarketplaceMapping(product),
    descriptionText,
    name: product.name,
    cartName: product.name,
    price: centsToDollars(priceCents),
    originalPrice: presentation?.originalPrice,
    kicker: presentation?.kicker ?? product.brand ?? "FORGE GYM",
    images,
    imageAlts:
      images.length > 0
        ? images.map((src) => {
            const dbMatch = sortedImages.find((image) => image.src === src);
            return getPresentationImageAlt(src) || dbMatch?.alt || `${product.name}`;
          })
        : presentation?.imageAlts,
    featureList: presentation?.featureList ?? [],
    intro:
      product.subtitle ||
      descriptionText ||
      presentation?.intro ||
      `${product.name} is managed through the FORGE Supabase catalog.`,
    descriptionSections: presentation?.descriptionSections ?? [],
    descriptionGalleryImages: presentation?.descriptionGalleryImages,
    specificationGroups: presentation?.specificationGroups ?? [],
    reviews: presentation?.reviews ?? [],
    buyNowUrl: presentation?.buyNowUrl ?? "/cart",
    href:
      presentation?.href ??
      (product.category === "belt" ? `/product/belt?variant=${product.slug}` : "/shop"),
    description:
      descriptionText ||
      presentation?.description ||
      `${product.name} is available in the FORGE catalog.`,
    category: categoryLabel,
    rating: presentation?.rating ?? 5,
    reviewCount: presentation?.reviewCount ?? 0,
  };
}

function storefrontResult(
  result: ProductQueryResult<ProductWithRelations[]>,
): ProductQueryResult<StorefrontProduct[]> {
  // Prefer live Supabase rows (real inventory). Only use presentation fallback
  // when the catalog is unreachable — and that fallback has zero sellable stock.
  if (result.missingEnv || result.error || result.data.length === 0) {
    if (result.error) {
      console.warn("[storefront] catalog fallback (zero stock):", result.error);
    }

    return {
      data: getFallbackStorefrontProducts(),
      error: result.error,
      missingEnv: result.missingEnv,
    };
  }

  return {
    ...result,
    data: sortStorefrontProducts(result.data.map(createStorefrontProduct)),
  };
}

export async function getStorefrontProducts(): Promise<
  ProductQueryResult<StorefrontProduct[]>
> {
  // When Supabase is known-down, return presentation catalog with zero stock
  // so the UI stays up without inventing inventory.
  if (!hasSupabaseEnvCheck() || isCatalogInCooldown()) {
    return {
      data: getFallbackStorefrontProducts(),
      error: isCatalogInCooldown()
        ? "Catalog cooldown active after recent Supabase timeout"
        : null,
      missingEnv: !hasSupabaseEnvCheck(),
    };
  }

  return storefrontResult(await getProducts());
}

function hasSupabaseEnvCheck() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function isCatalogInCooldown() {
  try {
    const raw = readFileSync("/tmp/forge-catalog-cooldown", "utf8");
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

export async function getFeaturedStorefrontProducts(): Promise<
  ProductQueryResult<StorefrontProduct[]>
> {
  const result = await getFeaturedProducts();

  if (result.missingEnv) {
    const fallback = getFallbackStorefrontProducts().filter((product) =>
      featuredProductOrder.includes(
        product.slug as (typeof featuredProductOrder)[number],
      ),
    );

    return {
      data: fallback,
      error: null,
      missingEnv: false,
    };
  }

  return storefrontResult(result);
}

export async function getStorefrontProductBySlug(
  slug: string,
): Promise<ProductQueryResult<StorefrontProduct | null>> {
  const fallback =
    getFallbackStorefrontProducts().find((product) => product.slug === slug) ?? null;

  if (!hasSupabaseEnvCheck() || isCatalogInCooldown()) {
    return {
      data: fallback,
      error: isCatalogInCooldown()
        ? "Catalog cooldown active after recent Supabase timeout"
        : null,
      missingEnv: !hasSupabaseEnvCheck(),
    };
  }

  const result = await getProductBySlug(slug);

  if (result.missingEnv || result.error || !result.data) {
    if (result.error) {
      console.warn(
        `[storefront] product fallback zero-stock (${slug}):`,
        result.error,
      );
    }

    return {
      data: fallback,
      error: result.error,
      missingEnv: result.missingEnv,
    };
  }

  return {
    ...result,
    data: createStorefrontProduct(result.data),
  };
}

export async function getBeltStorefrontProducts(): Promise<
  ProductQueryResult<StorefrontProduct[]>
> {
  const result = await getStorefrontProducts();

  return {
    ...result,
    data: result.data.filter((product) =>
      beltVariantOrder.includes(product.slug as (typeof beltVariantOrder)[number]),
    ),
  };
}

export async function getRelatedStorefrontProducts(
  slug: string,
  limit = 3,
): Promise<ProductQueryResult<StorefrontProduct[]>> {
  const collectionResult = await getStorefrontProducts();
  const currentProduct = collectionResult.data.find((product) => product.slug === slug);

  return {
    ...collectionResult,
    data: collectionResult.data
      .filter(
        (product) =>
          product.slug !== slug &&
          (!currentProduct || product.category === currentProduct.category),
      )
      .slice(0, limit),
  };
}

export {
  formatMarketplaceMapping,
  getFeaturedProducts,
  getMarketplaceListings,
  getProductBySlug,
  getProducts,
  getProductVariants,
  prepareInventorySync,
};
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
} from "@/lib/products/marketplace";
