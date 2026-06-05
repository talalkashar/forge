import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
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

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
  ].join("-");
}

await loadLocalEnv();

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

const { data, error } = await supabase
  .from("product_variants")
  .select(
    `
      name,
      sku,
      size,
      color,
      inventory_quantity,
      updated_at,
      products (
        name,
        slug
      )
    `,
  )
  .order("sku", { ascending: true });

if (error) {
  throw new Error(`Could not export inventory: ${error.message}`);
}

const snapshot = {
  exported_at: new Date().toISOString(),
  source: "forge-admin-inventory",
  variants: (data ?? []).map((variant) => ({
    product_name: variant.products?.name ?? null,
    product_slug: variant.products?.slug ?? null,
    variant_name: variant.name,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    inventory_quantity: variant.inventory_quantity ?? 0,
    updated_at: variant.updated_at,
  })),
};

await mkdir("backups", { recursive: true });

const outputPath = path.join("backups", `inventory-snapshot-${timestamp()}.json`);
await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Inventory snapshot exported: ${outputPath}`);
console.log(`Variants exported: ${snapshot.variants.length}`);
