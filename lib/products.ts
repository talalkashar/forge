import "server-only";

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
          inventory_quantity: 0,
          stripe_price_id: null,
          stripe_product_id: null,
          is_active: true,
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
            inventory_quantity: 0,
            stripe_price_id: null,
            stripe_product_id: null,
            is_active: true,
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
    brand: "FORGE",
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

function createStorefrontProduct(product: ProductWithRelations): StorefrontProduct {
  const presentation = productPresentationBySlug[product.slug];
  const variants = sortVariants(product.product_variants ?? []);
  const activeVariants = variants.filter((variant) => variant.is_active);
  const representativeVariant = firstActiveVariant(product);
  const sortedImages = sortImages(product.product_images ?? []);
  const imageSources = sortedImages.map((image) => image.src);
  const images = imageSources.length > 0 ? imageSources : presentation?.images ?? [];
  const priceCents = representativeVariant?.price_cents ?? product.base_price_cents;
  const categoryLabel = presentation?.categoryLabel ?? titleCase(product.category);
  const descriptionText = product.description?.trim() ?? "";

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand ?? "FORGE",
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
    kicker: presentation?.kicker ?? product.brand ?? "FORGE",
    images,
    imageAlts:
      sortedImages.length > 0
        ? sortedImages.map((image) => image.alt)
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
  if (result.missingEnv) {
    return {
      data: getFallbackStorefrontProducts(),
      error: null,
      missingEnv: false,
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
  return storefrontResult(await getProducts());
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
  const result = await getProductBySlug(slug);

  if (result.missingEnv) {
    return {
      data:
        getFallbackStorefrontProducts().find((product) => product.slug === slug) ?? null,
      error: null,
      missingEnv: false,
    };
  }

  return {
    ...result,
    data: result.data ? createStorefrontProduct(result.data) : null,
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
