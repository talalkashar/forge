export type AmazonConnectorStatus =
  | "not_configured"
  | "ready_to_test"
  | "not_implemented";

export type AmazonConnectorResult<T> =
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

export type AmazonReadOnlyClient = {
  configured: true;
  mode: "read_only";
};

export type AmazonListingPreview = {
  sellerSku: string;
  asin: string | null;
  externalListingId: string | null;
  title: string | null;
  inventoryQuantity: number | null;
  matchedVariantId: string | null;
  matchReason: "external_sku" | "variant_sku" | "asin" | "manual_review";
};

export type AmazonOrderPreview = {
  amazonOrderId: string;
  status: string;
  purchaseDate: string | null;
  matchedOrderId: string | null;
  itemCount: number;
};
