import "server-only";

export const TIKTOK_OAUTH_CALLBACK_PATH = "/api/marketplaces/tiktok/callback";

export type TikTokOAuthScaffoldStatus = {
  callbackPath: string;
  callbackRouteReady: boolean;
  tokenExchangeEnabled: boolean;
  tokenStorageEnabled: boolean;
  reviewStillRequired: boolean;
};

export type TikTokOAuthCallbackResult = {
  status: "error" | "missing_code" | "received";
  hasCode: boolean;
  hasState: boolean;
  error: string | null;
  errorDescription: string | null;
};

export type TikTokTokenExchangeResult = {
  status: "disabled";
  message: string;
};

export function getTikTokOAuthScaffoldStatus(): TikTokOAuthScaffoldStatus {
  return {
    callbackPath: TIKTOK_OAUTH_CALLBACK_PATH,
    callbackRouteReady: true,
    tokenExchangeEnabled: false,
    tokenStorageEnabled: false,
    reviewStillRequired: true,
  };
}

export function parseTikTokOAuthCallback(
  searchParams: URLSearchParams,
): TikTokOAuthCallbackResult {
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    return {
      status: "error",
      hasCode: Boolean(code),
      hasState: Boolean(state),
      error,
      errorDescription,
    };
  }

  if (!code) {
    return {
      status: "missing_code",
      hasCode: false,
      hasState: Boolean(state),
      error: null,
      errorDescription: null,
    };
  }

  return {
    status: "received",
    hasCode: true,
    hasState: Boolean(state),
    error: null,
    errorDescription: null,
  };
}

export async function exchangeTikTokAuthorizationCodeDisabled(): Promise<TikTokTokenExchangeResult> {
  return {
    status: "disabled",
    message:
      "TikTok token exchange is intentionally disabled. No access token, refresh token, or shop ID was requested or stored.",
  };
}
