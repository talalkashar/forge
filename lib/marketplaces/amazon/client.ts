import "server-only";

import { getAmazonCredentialStatus } from "./env";
import type { AmazonConnectorResult, AmazonReadOnlyClient } from "./types";

export function createAmazonReadOnlyClient(): AmazonConnectorResult<AmazonReadOnlyClient> {
  const credentials = getAmazonCredentialStatus();

  if (!credentials.configured) {
    return {
      status: "not_configured",
      message: "Amazon SP-API credentials are missing.",
      data: null,
    };
  }

  return {
    status: "ready_to_test",
    message:
      "Amazon credentials are configured. The read-only SP-API client implementation is intentionally not active yet.",
    data: {
      configured: true,
      mode: "read_only",
    },
  };
}
