import "server-only";

import { getAmazonCredentialStatus } from "./env";
import type { AmazonConnectorResult, AmazonReadOnlyClient } from "./types";

const AMAZON_LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";

const AMAZON_SP_API_ENDPOINTS: Record<string, string> = {
  na: "https://sellingpartnerapi-na.amazon.com",
  north_america: "https://sellingpartnerapi-na.amazon.com",
  us: "https://sellingpartnerapi-na.amazon.com",
  ca: "https://sellingpartnerapi-na.amazon.com",
  mx: "https://sellingpartnerapi-na.amazon.com",
  eu: "https://sellingpartnerapi-eu.amazon.com",
  europe: "https://sellingpartnerapi-eu.amazon.com",
  uk: "https://sellingpartnerapi-eu.amazon.com",
  gb: "https://sellingpartnerapi-eu.amazon.com",
  de: "https://sellingpartnerapi-eu.amazon.com",
  fr: "https://sellingpartnerapi-eu.amazon.com",
  it: "https://sellingpartnerapi-eu.amazon.com",
  es: "https://sellingpartnerapi-eu.amazon.com",
  fe: "https://sellingpartnerapi-fe.amazon.com",
  far_east: "https://sellingpartnerapi-fe.amazon.com",
  jp: "https://sellingpartnerapi-fe.amazon.com",
  au: "https://sellingpartnerapi-fe.amazon.com",
  sg: "https://sellingpartnerapi-fe.amazon.com",
};

function envValue(key: string) {
  return process.env[key]?.trim() ?? "";
}

function amazonEndpoint(region: string) {
  const normalized = region.trim().toLowerCase();

  return AMAZON_SP_API_ENDPOINTS[normalized] ?? region.trim().replace(/\/$/, "");
}

function safeConnectorError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Amazon SP-API preview error.";
}

async function requestLwaAccessToken() {
  const response = await fetch(AMAZON_LWA_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: envValue("AMAZON_REFRESH_TOKEN"),
      client_id: envValue("AMAZON_LWA_CLIENT_ID"),
      client_secret: envValue("AMAZON_LWA_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  } | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error_description ??
        payload?.error ??
        `Amazon LWA token request failed with status ${response.status}.`,
    );
  }

  return payload.access_token;
}

export function createAmazonReadOnlyClient(): AmazonConnectorResult<AmazonReadOnlyClient> {
  const credentials = getAmazonCredentialStatus();

  if (!credentials.configured) {
    return {
      status: "not_configured",
      message: "Amazon SP-API credentials are missing.",
      data: null,
    };
  }

  const endpoint = amazonEndpoint(envValue("AMAZON_REGION"));
  const marketplaceId = envValue("AMAZON_MARKETPLACE_ID");
  const sellerId = envValue("AMAZON_SELLER_ID");

  return {
    status: "ready_to_test",
    message: "Amazon credentials are configured. Read-only SP-API preview is enabled.",
    data: {
      configured: true,
      mode: "read_only",
      marketplaceId,
      sellerId,
      async request<T>(path: string, init: RequestInit = {}) {
        try {
          const accessToken = await requestLwaAccessToken();
          const response = await fetch(`${endpoint}${path}`, {
            ...init,
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-amz-access-token": accessToken,
              ...(init.headers ?? {}),
            },
            cache: "no-store",
          });
          const text = await response.text();
          const payload = text ? JSON.parse(text) : null;

          if (!response.ok) {
            throw new Error(
              payload?.errors?.[0]?.message ??
                payload?.message ??
                `Amazon SP-API request failed with status ${response.status}.`,
            );
          }

          return payload as T;
        } catch (error) {
          throw new Error(safeConnectorError(error));
        }
      },
    },
  };
}
