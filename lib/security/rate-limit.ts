import "server-only";

import { createHash } from "crypto";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/service-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  limited: boolean;
  remaining: number;
  retryAfter: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();
const MAX_MEMORY_KEYS = 5_000;
const STORAGE_BUCKET = "forge-rate-limits";

/** Best-effort client IP (Vercel / CF / reverse proxies). */
export function clientIp(headers: Pick<Headers, "get">) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function pruneExpired(now: number) {
  if (store.size < MAX_MEMORY_KEYS) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
    return;
  }

  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }

  if (store.size >= MAX_MEMORY_KEYS) {
    const keys = [...store.keys()];
    const dropCount = Math.floor(keys.length / 2);
    for (let i = 0; i < dropCount; i += 1) {
      store.delete(keys[i]!);
    }
  }
}

function checkMemoryRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      limited: false,
      remaining: Math.max(0, options.limit - 1),
      retryAfter: 0,
    };
  }

  current.count += 1;

  if (current.count > options.limit) {
    return {
      limited: true,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  return {
    limited: false,
    remaining: Math.max(0, options.limit - current.count),
    retryAfter: 0,
  };
}

/**
 * Optional durable counter via Upstash Redis REST / Vercel KV.
 */
async function checkUpstashRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult | null> {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).replace(/\/$/, "");
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redisKey = `forge:rl:${key}`;
  const windowSec = Math.max(1, Math.ceil(options.windowMs / 1000));

  try {
    const incrRes = await fetch(`${url}/incr/${encodeURIComponent(redisKey)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!incrRes.ok) {
      return null;
    }

    const incrJson = (await incrRes.json()) as { result?: number };
    const count = Number(incrJson.result ?? 0);

    if (count === 1) {
      await fetch(
        `${url}/expire/${encodeURIComponent(redisKey)}/${windowSec}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
    }

    if (count > options.limit) {
      const ttlRes = await fetch(`${url}/ttl/${encodeURIComponent(redisKey)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const ttlJson = ttlRes.ok
        ? ((await ttlRes.json()) as { result?: number })
        : { result: windowSec };
      const ttl = Number(ttlJson.result ?? windowSec);

      return {
        limited: true,
        remaining: 0,
        retryAfter: ttl > 0 ? ttl : windowSec,
      };
    }

    return {
      limited: false,
      remaining: Math.max(0, options.limit - count),
      retryAfter: 0,
    };
  } catch {
    return null;
  }
}

function storageObjectPath(key: string) {
  const hash = createHash("sha256").update(key).digest("hex");
  return `rl/${hash}.json`;
}

/**
 * Durable shared counters via a private Supabase Storage bucket.
 * Created automatically with the service role (no SQL required).
 * Slight race under extreme concurrency is acceptable for storefront abuse control.
 */
async function checkStorageRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult | null> {
  if (!hasSupabaseServiceRoleEnv()) {
    return null;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const path = storageObjectPath(key);
    const now = Date.now();
    const resetAt = now + options.windowMs;

    // Ensure private bucket exists (idempotent).
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasBucket = (buckets ?? []).some((b) => b.name === STORAGE_BUCKET);
    if (!hasBucket) {
      const { error: createError } = await supabase.storage.createBucket(
        STORAGE_BUCKET,
        { public: false, fileSizeLimit: 2048 },
      );
      if (createError && !/already exists/i.test(createError.message)) {
        return null;
      }
    }

    let count = 0;
    let windowResetAt = resetAt;

    const { data: blob, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(path);

    if (!downloadError && blob) {
      try {
        const parsed = JSON.parse(await blob.text()) as {
          count?: number;
          resetAt?: number;
        };
        if (
          typeof parsed.resetAt === "number" &&
          parsed.resetAt > now &&
          typeof parsed.count === "number"
        ) {
          count = parsed.count;
          windowResetAt = parsed.resetAt;
        }
      } catch {
        // Corrupt payload — start a fresh window.
      }
    }

    count += 1;

    const payload = JSON.stringify({ count, resetAt: windowResetAt });
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, payload, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      return null;
    }

    if (count > options.limit) {
      return {
        limited: true,
        remaining: 0,
        retryAfter: Math.max(1, Math.ceil((windowResetAt - now) / 1000)),
      };
    }

    return {
      limited: false,
      remaining: Math.max(0, options.limit - count),
      retryAfter: 0,
    };
  } catch {
    return null;
  }
}

/**
 * Optional SQL table path (if migration was applied).
 */
async function checkSupabaseTableRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult | null> {
  if (!hasSupabaseServiceRoleEnv()) {
    return null;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const now = Date.now();
    const resetAtMs = now + options.windowMs;
    const bucketKey = key.slice(0, 240);

    const { data: existing, error: readError } = await supabase
      .from("rate_limit_buckets")
      .select("bucket_key, hit_count, reset_at")
      .eq("bucket_key", bucketKey)
      .maybeSingle();

    if (readError) {
      return null;
    }

    const existingResetMs = existing?.reset_at
      ? new Date(existing.reset_at as string).getTime()
      : 0;

    if (!existing || existingResetMs <= now) {
      const { error: upsertError } = await supabase
        .from("rate_limit_buckets")
        .upsert(
          {
            bucket_key: bucketKey,
            hit_count: 1,
            reset_at: new Date(resetAtMs).toISOString(),
            updated_at: new Date(now).toISOString(),
          },
          { onConflict: "bucket_key" },
        );

      if (upsertError) {
        return null;
      }

      return {
        limited: false,
        remaining: Math.max(0, options.limit - 1),
        retryAfter: 0,
      };
    }

    const nextCount = Number(existing.hit_count ?? 0) + 1;
    const { error: updateError } = await supabase
      .from("rate_limit_buckets")
      .update({
        hit_count: nextCount,
        updated_at: new Date(now).toISOString(),
      })
      .eq("bucket_key", bucketKey);

    if (updateError) {
      return null;
    }

    if (nextCount > options.limit) {
      return {
        limited: true,
        remaining: 0,
        retryAfter: Math.max(1, Math.ceil((existingResetMs - now) / 1000)),
      };
    }

    return {
      limited: false,
      remaining: Math.max(0, options.limit - nextCount),
      retryAfter: 0,
    };
  } catch {
    return null;
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions) {
  return checkMemoryRateLimit(key, options);
}

/**
 * Async limiter priority:
 * 1) Upstash / Vercel KV REST
 * 2) Supabase Storage (auto-provisioned private bucket — no SQL needed)
 * 3) Supabase rate_limit_buckets table (optional migration)
 * 4) In-memory per instance
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const upstash = await checkUpstashRateLimit(key, options);
  if (upstash) return upstash;

  const storage = await checkStorageRateLimit(key, options);
  if (storage) return storage;

  const table = await checkSupabaseTableRateLimit(key, options);
  if (table) return table;

  return checkMemoryRateLimit(key, options);
}
