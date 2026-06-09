import "server-only";

import { createTikTokReadOnlyClient } from "./client";
import type { TikTokConnectorResult, TikTokProductPreview } from "./types";

export async function previewTikTokProductsImport(): Promise<
  TikTokConnectorResult<TikTokProductPreview[]>
> {
  const client = createTikTokReadOnlyClient();

  if (client.status === "not_configured") {
    return client;
  }

  return {
    status: "not_implemented",
    message:
      "TikTok Shop product import preview is scaffolded but not implemented. Next step: pull products read-only and match by external SKU, variant SKU, then product/listing ID.",
    data: null,
  };
}
