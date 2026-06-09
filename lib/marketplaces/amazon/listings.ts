import "server-only";

import { createAmazonReadOnlyClient } from "./client";
import type { AmazonConnectorResult, AmazonListingPreview } from "./types";

export async function previewAmazonListingsImport(): Promise<
  AmazonConnectorResult<AmazonListingPreview[]>
> {
  const client = createAmazonReadOnlyClient();

  if (client.status === "not_configured") {
    return client;
  }

  return {
    status: "not_implemented",
    message:
      "Amazon listing import preview is scaffolded but not implemented. Next step: pull listings read-only and match by external SKU, variant SKU, then ASIN.",
    data: null,
  };
}
