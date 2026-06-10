#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const AMAZON_REQUIRED_VARS = [
  "AMAZON_SELLER_ID",
  "AMAZON_MARKETPLACE_ID",
  "AMAZON_LWA_CLIENT_ID",
  "AMAZON_LWA_CLIENT_SECRET",
  "AMAZON_REFRESH_TOKEN",
  "AMAZON_REGION",
];

const TIKTOK_REQUIRED_VARS = [
  "TIKTOK_SHOP_APP_KEY",
  "TIKTOK_SHOP_APP_SECRET",
  "TIKTOK_SHOP_REGION",
  "TIKTOK_SHOP_ACCESS_TOKEN",
  "TIKTOK_SHOP_REFRESH_TOKEN",
  "TIKTOK_SHOP_ID",
];

function parseEnvLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");
  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadLocalEnvPresence() {
  const envPath = resolve(process.cwd(), ".env.local");
  const values = new Map();

  if (!existsSync(envPath)) {
    return { envPath, exists: false, values };
  }

  const envText = readFileSync(envPath, "utf8");

  for (const line of envText.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);

    if (parsed) {
      values.set(parsed.key, parsed.value);
    }
  }

  return { envPath, exists: true, values };
}

function getMissing(requiredVars, values) {
  return requiredVars.filter((key) => {
    const value = values.get(key) ?? process.env[key] ?? "";
    return value.trim().length === 0;
  });
}

function printReadiness(label, requiredVars, values) {
  const missing = getMissing(requiredVars, values);
  const ready = missing.length === 0;

  console.log(`${label}: ${ready ? "ready" : "missing credentials"}`);
  console.log(`  Present: ${requiredVars.length - missing.length}/${requiredVars.length}`);

  if (missing.length > 0) {
    console.log(`  Missing: ${missing.join(", ")}`);
  } else {
    console.log("  Missing: none");
  }
}

try {
  const { exists, values } = loadLocalEnvPresence();

  console.log(`.env.local: ${exists ? "found" : "missing"}`);
  printReadiness("Amazon SP-API", AMAZON_REQUIRED_VARS, values);
  printReadiness("TikTok Shop", TIKTOK_REQUIRED_VARS, values);
  process.exitCode = 0;
} catch (error) {
  console.error("Credential readiness check failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
