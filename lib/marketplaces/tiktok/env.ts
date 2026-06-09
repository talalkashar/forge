import "server-only";

const TIKTOK_ENV_KEYS = [
  "TIKTOK_SHOP_APP_KEY",
  "TIKTOK_SHOP_APP_SECRET",
  "TIKTOK_SHOP_ACCESS_TOKEN",
  "TIKTOK_SHOP_REFRESH_TOKEN",
  "TIKTOK_SHOP_ID",
  "TIKTOK_SHOP_REGION",
] as const;

export type TikTokEnvKey = (typeof TIKTOK_ENV_KEYS)[number];

export type MarketplaceCredentialField = {
  key: string;
  label: string;
  present: boolean;
};

export type TikTokCredentialStatus = {
  configured: boolean;
  missingKeys: TikTokEnvKey[];
  appKeyPresent: boolean;
  shopIdPresent: boolean;
  accessTokenPresent: boolean;
  refreshTokenPresent: boolean;
  fields: MarketplaceCredentialField[];
};

function hasValue(key: TikTokEnvKey) {
  return Boolean(process.env[key]?.trim());
}

export function getTikTokCredentialStatus(): TikTokCredentialStatus {
  const missingKeys = TIKTOK_ENV_KEYS.filter((key) => !hasValue(key));

  return {
    configured: missingKeys.length === 0,
    missingKeys,
    appKeyPresent: hasValue("TIKTOK_SHOP_APP_KEY"),
    shopIdPresent: hasValue("TIKTOK_SHOP_ID"),
    accessTokenPresent: hasValue("TIKTOK_SHOP_ACCESS_TOKEN"),
    refreshTokenPresent: hasValue("TIKTOK_SHOP_REFRESH_TOKEN"),
    fields: [
      {
        key: "TIKTOK_SHOP_APP_KEY",
        label: "App key",
        present: hasValue("TIKTOK_SHOP_APP_KEY"),
      },
      {
        key: "TIKTOK_SHOP_APP_SECRET",
        label: "App secret",
        present: hasValue("TIKTOK_SHOP_APP_SECRET"),
      },
      {
        key: "TIKTOK_SHOP_ACCESS_TOKEN",
        label: "Access token",
        present: hasValue("TIKTOK_SHOP_ACCESS_TOKEN"),
      },
      {
        key: "TIKTOK_SHOP_REFRESH_TOKEN",
        label: "Refresh token",
        present: hasValue("TIKTOK_SHOP_REFRESH_TOKEN"),
      },
      {
        key: "TIKTOK_SHOP_ID",
        label: "Shop ID",
        present: hasValue("TIKTOK_SHOP_ID"),
      },
      {
        key: "TIKTOK_SHOP_REGION",
        label: "Region",
        present: hasValue("TIKTOK_SHOP_REGION"),
      },
    ],
  };
}
