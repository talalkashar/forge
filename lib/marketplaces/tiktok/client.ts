import "server-only";

import { createHmac } from "node:crypto";
import { getTikTokCredentialStatus } from "./env";
import type { TikTokConnectorResult, TikTokReadOnlyClient } from "./types";

const TIKTOK_API_ENDPOINTS: Record<string, string> = {
  global: "https://open-api.tiktokglobalshop.com",
  us: "https://open-api.tiktokglobalshop.com",
  uk: "https://open-api.tiktokglobalshop.com",
  eu: "https://open-api.tiktokglobalshop.com",
  sea: "https://open-api.tiktokglobalshop.com",
};

function envValue(key: string) {
  return process.env[key]?.trim() ?? "";
}

function apiEndpoint(region: string) {
  const normalized = region.trim().toLowerCase();

  return TIKTOK_API_ENDPOINTS[normalized] ?? region.trim().replace(/\/$/, "");
}

function safeConnectorError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown TikTok Shop preview error.";
}

function signaturePayload(path: string, params: URLSearchParams, body: string) {
  const sortedPairs = [...params.entries()]
    .filter(([key]) => key !== "sign" && key !== "access_token")
    .sort(([left], [right]) => left.localeCompare(right));
  const queryPayload = sortedPairs.map(([key, value]) => `${key}${value}`).join("");

  return `${path}${queryPayload}${body}`;
}

function signRequest(path: string, params: URLSearchParams, body: string) {
  const secret = envValue("TIKTOK_SHOP_APP_SECRET");
  const payload = `${secret}${signaturePayload(path, params, body)}${secret}`;

  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createTikTokReadOnlyClient(): TikTokConnectorResult<TikTokReadOnlyClient> {
  const credentials = getTikTokCredentialStatus();

  if (!credentials.configured) {
    return {
      status: "not_configured",
      message: "TikTok Shop API credentials are missing.",
      data: null,
    };
  }

  const endpoint = apiEndpoint(envValue("TIKTOK_SHOP_REGION"));
  const appKey = envValue("TIKTOK_SHOP_APP_KEY");
  const shopId = envValue("TIKTOK_SHOP_ID");
  const accessToken = envValue("TIKTOK_SHOP_ACCESS_TOKEN");

  return {
    status: "ready_to_test",
    message: "TikTok Shop credentials are configured. Read-only product preview is enabled.",
    data: {
      configured: true,
      mode: "read_only",
      shopId,
      async request<T>(path: string, init: RequestInit = {}) {
        try {
          const method = init.method ?? "GET";
          const body = typeof init.body === "string" ? init.body : "";
          const params = new URLSearchParams({
            app_key: appKey,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            shop_cipher: shopId,
          });
          const sign = signRequest(path, params, body);
          params.set("sign", sign);
          const response = await fetch(`${endpoint}${path}?${params.toString()}`, {
            ...init,
            method,
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-tts-access-token": accessToken,
              ...(init.headers ?? {}),
            },
            cache: "no-store",
          });
          const text = await response.text();
          const payload = text ? JSON.parse(text) : null;
          const code = payload?.code;

          if (!response.ok || (code !== undefined && code !== 0 && code !== "0")) {
            throw new Error(
              payload?.message ??
                payload?.msg ??
                `TikTok Shop request failed with status ${response.status}.`,
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
