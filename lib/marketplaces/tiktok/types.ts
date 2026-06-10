export type TikTokConnectorStatus =
  | "not_configured"
  | "ready_to_test"
  | "not_implemented"
  | "error";

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
      status: "error";
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
  shopId: string;
  request<T>(path: string, init?: RequestInit): Promise<T>;
};

export type TikTokProductPreview = {
  productId: string | null;
  listingId: string | null;
  sellerSku: string;
  title: string | null;
  status: string | null;
  inventoryQuantity: number | null;
  matchedVariantId: string | null;
  matchedSku: string | null;
  matchedProductName: string | null;
  matchReason:
    | "external_sku"
    | "variant_sku"
    | "external_product_id"
    | "external_listing_id"
    | "product_id"
    | "manual_review";
};

export type TikTokOrderPreview = {
  orderId: string;
  status: string;
  createdAt: string | null;
  matchedOrderId: string | null;
  itemCount: number;
};
