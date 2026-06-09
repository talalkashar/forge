import "server-only";

import { getTikTokCredentialStatus } from "./env";
import type { TikTokConnectorResult, TikTokReadOnlyClient } from "./types";

export function createTikTokReadOnlyClient(): TikTokConnectorResult<TikTokReadOnlyClient> {
  const credentials = getTikTokCredentialStatus();

  if (!credentials.configured) {
    return {
      status: "not_configured",
      message: "TikTok Shop API credentials are missing.",
      data: null,
    };
  }

  return {
    status: "ready_to_test",
    message:
      "TikTok Shop credentials are configured. The read-only product/order client implementation is intentionally not active yet.",
    data: {
      configured: true,
      mode: "read_only",
    },
  };
}
