import "server-only";

import { createTikTokReadOnlyClient } from "./client";
import type { TikTokConnectorResult, TikTokOrderPreview } from "./types";

export async function previewTikTokOrdersImport(): Promise<
  TikTokConnectorResult<TikTokOrderPreview[]>
> {
  const client = createTikTokReadOnlyClient();

  if (client.status === "not_configured") {
    return client;
  }

  return {
    status: "not_implemented",
    message:
      "TikTok Shop order import preview is scaffolded but not implemented. No orders or inventory movements are imported yet.",
    data: null,
  };
}
