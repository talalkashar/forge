import "server-only";

import { createAmazonReadOnlyClient } from "./client";
import type { AmazonConnectorResult, AmazonOrderPreview } from "./types";

export async function previewAmazonOrdersImport(): Promise<
  AmazonConnectorResult<AmazonOrderPreview[]>
> {
  const client = createAmazonReadOnlyClient();

  if (client.status === "not_configured") {
    return client;
  }

  return {
    status: "not_implemented",
    message:
      "Amazon order import preview is scaffolded but not implemented. No orders or inventory movements are imported yet.",
    data: null,
  };
}
