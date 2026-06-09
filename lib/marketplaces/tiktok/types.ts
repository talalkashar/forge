export type TikTokConnectorStatus =
  | "not_configured"
  | "ready_to_test"
  | "not_implemented";

export type TikTokConnectorResult<T> =
  | {
      status: "not_configured";
      message: string;
      data: null;
    }
  | {
      status: "not_implemented";
      message: string;
      data: null;
    }
  | {
      status: "ready_to_test";
      message: string;
      data: T;
    };

export type TikTokReadOnlyClient = {
  configured: true;
  mode: "read_only";
};

export type TikTokProductPreview = {
  productId: string | null;
  listingId: string | null;
  sellerSku: string;
  title: string | null;
  inventoryQuantity: number | null;
  matchedVariantId: string | null;
  matchReason: "external_sku" | "variant_sku" | "product_id" | "manual_review";
};

export type TikTokOrderPreview = {
  orderId: string;
  status: string;
  createdAt: string | null;
  matchedOrderId: string | null;
  itemCount: number;
};
