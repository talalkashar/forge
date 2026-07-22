/**
 * Applies public.rate_limit_buckets via Supabase SQL HTTP if available,
 * otherwise prints the SQL to run in the Supabase SQL editor.
 *
 * Usage: node scripts/apply-rate-limit-schema.mjs
 * Loads .env.local from repo root (no secrets printed).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) return {};
  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const sqlPath = resolve(
  root,
  "supabase/migrations/20260722_rate_limit_buckets.sql",
);
const sql = readFileSync(sqlPath, "utf8");

if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sb = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const probe = await sb.from("rate_limit_buckets").select("bucket_key").limit(1);
if (!probe.error) {
  console.log("rate_limit_buckets already exists — nothing to do.");
  process.exit(0);
}

console.log("Table missing (" + (probe.error?.code || "unknown") + ").");
console.log("");
console.log("Run this SQL in Supabase Dashboard → SQL Editor → New query:");
console.log("https://supabase.com/dashboard/project/_/sql");
console.log("");
console.log("--- begin SQL ---");
console.log(sql.trim());
console.log("--- end SQL ---");
console.log("");
console.log(
  "After it runs, durable rate limits work automatically (service role only).",
);
process.exit(2);
