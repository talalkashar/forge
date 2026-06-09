import "server-only";

const AMAZON_ENV_KEYS = [
  "AMAZON_SELLER_ID",
  "AMAZON_MARKETPLACE_ID",
  "AMAZON_LWA_CLIENT_ID",
  "AMAZON_LWA_CLIENT_SECRET",
  "AMAZON_REFRESH_TOKEN",
  "AMAZON_REGION",
] as const;

export type AmazonEnvKey = (typeof AMAZON_ENV_KEYS)[number];

export type MarketplaceCredentialField = {
  key: string;
  label: string;
  present: boolean;
};

export type AmazonCredentialStatus = {
  configured: boolean;
  missingKeys: AmazonEnvKey[];
  sellerIdPresent: boolean;
  marketplaceIdPresent: boolean;
  refreshTokenPresent: boolean;
  fields: MarketplaceCredentialField[];
};

function hasValue(key: AmazonEnvKey) {
  return Boolean(process.env[key]?.trim());
}

export function getAmazonCredentialStatus(): AmazonCredentialStatus {
  const missingKeys = AMAZON_ENV_KEYS.filter((key) => !hasValue(key));

  return {
    configured: missingKeys.length === 0,
    missingKeys,
    sellerIdPresent: hasValue("AMAZON_SELLER_ID"),
    marketplaceIdPresent: hasValue("AMAZON_MARKETPLACE_ID"),
    refreshTokenPresent: hasValue("AMAZON_REFRESH_TOKEN"),
    fields: [
      {
        key: "AMAZON_SELLER_ID",
        label: "Seller ID",
        present: hasValue("AMAZON_SELLER_ID"),
      },
      {
        key: "AMAZON_MARKETPLACE_ID",
        label: "Marketplace ID",
        present: hasValue("AMAZON_MARKETPLACE_ID"),
      },
      {
        key: "AMAZON_LWA_CLIENT_ID",
        label: "LWA client ID",
        present: hasValue("AMAZON_LWA_CLIENT_ID"),
      },
      {
        key: "AMAZON_LWA_CLIENT_SECRET",
        label: "LWA client secret",
        present: hasValue("AMAZON_LWA_CLIENT_SECRET"),
      },
      {
        key: "AMAZON_REFRESH_TOKEN",
        label: "Refresh token",
        present: hasValue("AMAZON_REFRESH_TOKEN"),
      },
      {
        key: "AMAZON_REGION",
        label: "Region",
        present: hasValue("AMAZON_REGION"),
      },
    ],
  };
}
