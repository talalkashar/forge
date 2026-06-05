export type MarketplaceChannel =
  | "website"
  | "stripe"
  | "amazon"
  | "tiktok_shop"
  | "manual";
export type ProductStatus = "active" | "draft" | "archived" | string;
export type MarketplaceSyncStatus =
  | "not_connected"
  | "draft"
  | "connected"
  | "needs_review"
  | "synced"
  | "error"
  | string;

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  status: ProductStatus;
  base_price_cents: number;
  currency: string;
  brand: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  price_cents: number | null;
  inventory_quantity: number | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  src: string;
  alt: string;
  position: number | null;
  is_primary: boolean | null;
};

export type MarketplaceListingRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  channel: MarketplaceChannel | string;
  external_product_id: string | null;
  external_listing_id: string | null;
  external_sku: string | null;
  listing_url: string | null;
  sync_status: MarketplaceSyncStatus | null;
  last_synced_at: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type InventoryMovementRow = {
  id: string;
  variant_id: string;
  channel: MarketplaceChannel | string;
  quantity_change: number;
  reason: string;
  external_order_id: string | null;
  created_at: string | null;
};

export type OrderRow = {
  id: string;
  channel: MarketplaceChannel | string;
  external_order_id: string | null;
  customer_email: string | null;
  status: string;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
  created_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price_cents: number;
  created_at: string | null;
};

export type ProductWithRelations = ProductRow & {
  product_variants?: ProductVariantRow[];
  product_images?: ProductImageRow[];
  marketplace_listings?: MarketplaceListingRow[];
};

export type ProductQueryResult<T> = {
  data: T;
  error: string | null;
  missingEnv: boolean;
};

export type WebsiteProductPayload = {
  productId: string;
  slug: string;
  name: string;
  status: ProductStatus;
  priceCents: number;
  currency: string;
};

export type StripeVariantPayload = {
  variantId: string;
  sku: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  priceCents: number;
  currency: string;
};

export type AmazonVariantPayload = {
  productId: string | null;
  listingId: string | null;
  sku: string | null;
  listingUrl: string | null;
  syncStatus: MarketplaceSyncStatus;
};

export type TikTokVariantPayload = {
  productId: string | null;
  listingId: string | null;
  sku: string | null;
  listingUrl: string | null;
  syncStatus: MarketplaceSyncStatus;
};

export type MarketplaceMapping = {
  website: WebsiteProductPayload;
  variants: Array<{
    variantId: string;
    sku: string;
    size: string | null;
    color: string | null;
    inventoryQuantity: number;
    stripe: StripeVariantPayload;
    amazon: AmazonVariantPayload;
    tiktokShop: TikTokVariantPayload;
  }>;
};

export type InventorySyncPreparation = {
  variantId: string;
  sku: string;
  inventoryQuantity: number;
  active: boolean;
  channels: MarketplaceChannel[];
};
