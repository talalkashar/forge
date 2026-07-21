#!/usr/bin/env node
/**
 * Live inventory status (read-only).
 * TikTok Shop is the inventory source of truth; Supabase mirrors website stock.
 * Usage: npm run inventory:status
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id, slug, name, status")
  .order("sort_order", { ascending: true });

if (productsError) {
  console.error("products error:", productsError.message);
  process.exit(1);
}

const { data: variants, error: variantsError } = await supabase
  .from("product_variants")
  .select(
    "id, product_id, sku, size, color, inventory_quantity, is_active, stripe_price_id",
  )
  .order("sku", { ascending: true });

if (variantsError) {
  console.error("variants error:", variantsError.message);
  process.exit(1);
}

const { data: tiktokListings, error: listingsError } = await supabase
  .from("marketplace_listings")
  .select(
    "variant_id, external_sku, external_product_id, listing_url, sync_status",
  )
  .eq("channel", "tiktok_shop");

if (listingsError) {
  console.error("tiktok listings error:", listingsError.message);
  process.exit(1);
}

const byProduct = new Map((products ?? []).map((p) => [p.id, p]));
const tiktokByVariant = new Map(
  (tiktokListings ?? [])
    .filter((row) => row.variant_id)
    .map((row) => [row.variant_id, row]),
);
const total = (variants ?? []).reduce(
  (sum, v) => sum + (v.inventory_quantity ?? 0),
  0,
);
const zero = (variants ?? []).filter((v) => (v.inventory_quantity ?? 0) <= 0);
const inactive = (variants ?? []).filter((v) => !v.is_active);
const connectedTikTok = (tiktokListings ?? []).filter(
  (row) => row.sync_status === "connected" && row.external_product_id,
).length;

console.log("FORGE inventory status");
console.log("Source of truth: TikTok Shop (website qty mirrors TikTok)");
console.log(
  "Store: https://shop.tiktok.com/us/store/forgesports/7496252332747098142",
);
console.log(`Supabase: ${url}`);
console.log(`Products: ${(products ?? []).length}`);
console.log(`Variants: ${(variants ?? []).length}`);
console.log(`Website total units: ${total}`);
console.log(`Zero stock (website): ${zero.length}`);
console.log(`Inactive: ${inactive.length}`);
console.log(
  `TikTok listings connected: ${connectedTikTok}/${(tiktokListings ?? []).length}`,
);
console.log("");
console.log(
  "SKU".padEnd(24),
  "PRODUCT".padEnd(10),
  "SIZE".padEnd(5),
  "QTY".padStart(4),
  "ACTIVE".padStart(7),
  "TIKTOK".padStart(10),
  "TT_PRODUCT_ID",
);
console.log("-".repeat(90));

for (const v of variants ?? []) {
  const product = byProduct.get(v.product_id);
  const tt = tiktokByVariant.get(v.id);
  console.log(
    String(v.sku).padEnd(24),
    String(product?.slug ?? "?").padEnd(10),
    String(v.size ?? "-").padEnd(5),
    String(v.inventory_quantity ?? 0).padStart(4),
    String(Boolean(v.is_active)).padStart(7),
    String(tt?.sync_status ?? "—").padStart(10),
    String(tt?.external_product_id ?? "—"),
  );
}

if (zero.length) {
  console.log("\nZero / unavailable on website (confirm against TikTok):");
  for (const v of zero) {
    const tt = tiktokByVariant.get(v.id);
    console.log(
      `  - ${v.sku} (qty=${v.inventory_quantity ?? 0}, active=${v.is_active}, tiktok=${tt?.listing_url ?? "unmapped"})`,
    );
  }
}

console.log(
  "\nOK — always reconcile website qty with TikTok Shop before selling.",
);