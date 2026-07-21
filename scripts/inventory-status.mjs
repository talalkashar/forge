#!/usr/bin/env node
/**
 * Live inventory status from Supabase (read-only).
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

const byProduct = new Map((products ?? []).map((p) => [p.id, p]));
const total = (variants ?? []).reduce(
  (sum, v) => sum + (v.inventory_quantity ?? 0),
  0,
);
const zero = (variants ?? []).filter((v) => (v.inventory_quantity ?? 0) <= 0);
const inactive = (variants ?? []).filter((v) => !v.is_active);

console.log("FORGE live inventory (Supabase)");
console.log(`URL: ${url}`);
console.log(`Products: ${(products ?? []).length}`);
console.log(`Variants: ${(variants ?? []).length}`);
console.log(`Total units: ${total}`);
console.log(`Zero stock: ${zero.length}`);
console.log(`Inactive: ${inactive.length}`);
console.log("");
console.log(
  "SKU".padEnd(24),
  "PRODUCT".padEnd(18),
  "SIZE".padEnd(5),
  "QTY".padStart(4),
  "ACTIVE".padStart(7),
  "STRIPE".padStart(7),
);
console.log("-".repeat(72));

for (const v of variants ?? []) {
  const product = byProduct.get(v.product_id);
  console.log(
    String(v.sku).padEnd(24),
    String(product?.slug ?? "?").padEnd(18),
    String(v.size ?? "-").padEnd(5),
    String(v.inventory_quantity ?? 0).padStart(4),
    String(Boolean(v.is_active)).padStart(7),
    String(v.stripe_price_id ? "yes" : "no").padStart(7),
  );
}

if (zero.length) {
  console.log("\nZero / unavailable:");
  for (const v of zero) {
    console.log(
      `  - ${v.sku} (qty=${v.inventory_quantity ?? 0}, active=${v.is_active})`,
    );
  }
}

console.log("\nOK — catalog is live from Supabase.");
