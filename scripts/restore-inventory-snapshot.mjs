import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

async function loadLocalEnv() {
  try {
    const contents = await readFile(".env.local", "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      process.env[key] ??= valueParts.join("=").replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Vercel and CI should provide env vars directly.
  }
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function usage() {
  console.log("Usage: npm run inventory:restore -- backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json");
  console.log("Dry run: npm run inventory:restore -- --dry-run backups/inventory-snapshot-YYYY-MM-DD-HH-mm.json");
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const snapshotPath = args.find((arg) => arg !== "--dry-run");

if (!snapshotPath) {
  usage();
  process.exit(1);
}

await loadLocalEnv();

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const variants = Array.isArray(snapshot.variants) ? snapshot.variants : [];
const restoreRows = variants
  .map((variant) => ({
    sku: typeof variant.sku === "string" ? variant.sku.trim() : "",
    inventory_quantity: Number.parseInt(String(variant.inventory_quantity), 10),
  }))
  .filter((variant) => variant.sku && Number.isFinite(variant.inventory_quantity));

if (restoreRows.length === 0) {
  throw new Error("Snapshot did not contain any valid SKU inventory rows.");
}

const supabase = createClient(
  requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const { data: currentRows, error: fetchError } = await supabase
  .from("product_variants")
  .select("id, sku, inventory_quantity")
  .in(
    "sku",
    restoreRows.map((row) => row.sku),
  );

if (fetchError) {
  throw new Error(`Could not load current inventory: ${fetchError.message}`);
}

const currentBySku = new Map((currentRows ?? []).map((row) => [row.sku, row]));
let updated = 0;
let unchanged = 0;
let missing = 0;

for (const row of restoreRows) {
  const current = currentBySku.get(row.sku);

  if (!current) {
    missing += 1;
    console.warn(`Skipped missing SKU: ${row.sku}`);
    continue;
  }

  const previousQuantity = current.inventory_quantity ?? 0;
  const quantityChange = row.inventory_quantity - previousQuantity;

  if (quantityChange === 0) {
    unchanged += 1;
    continue;
  }

  if (dryRun) {
    console.log(`Would update ${row.sku}: ${previousQuantity} -> ${row.inventory_quantity}`);
    updated += 1;
    continue;
  }

  const { error: updateError } = await supabase
    .from("product_variants")
    .update({ inventory_quantity: row.inventory_quantity })
    .eq("id", current.id);

  if (updateError) {
    throw new Error(`Could not update ${row.sku}: ${updateError.message}`);
  }

  const { error: movementError } = await supabase
    .from("inventory_movements")
    .insert({
      variant_id: current.id,
      channel: "manual",
      quantity_change: quantityChange,
      reason: "inventory_restore",
    });

  if (movementError) {
    throw new Error(`Could not insert inventory movement for ${row.sku}: ${movementError.message}`);
  }

  updated += 1;
}

console.log(`Inventory restore ${dryRun ? "dry run " : ""}complete.`);
console.log(`Updated: ${updated}`);
console.log(`Unchanged: ${unchanged}`);
console.log(`Missing SKUs: ${missing}`);
