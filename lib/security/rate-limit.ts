import "server-only";

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
 * Optional durable counter via Upstash Redis REST.
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_*).
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

/**
 * Durable counter shared across serverless instances via Supabase service role.
 * Requires public.rate_limit_buckets (see supabase/migrations/20260722_rate_limit_buckets.sql).
 */
async function checkSupabaseRateLimit(
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
      // Table missing or RLS/permissions issue — fall through.
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
        retryAfter: Math.max(
          1,
          Math.ceil((existingResetMs - now) / 1000),
        ),
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

/**
 * Sync in-memory limiter (fast path / local dev).
 * Prefer `checkRateLimitAsync` on public APIs in production.
 */
export function checkRateLimit(key: string, options: RateLimitOptions) {
  return checkMemoryRateLimit(key, options);
}

/**
 * Async limiter priority:
 * 1) Upstash / Vercel KV REST (if configured)
 * 2) Supabase rate_limit_buckets (service role)
 * 3) In-memory per instance
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const upstash = await checkUpstashRateLimit(key, options);
  if (upstash) {
    return upstash;
  }

  const supabase = await checkSupabaseRateLimit(key, options);
  if (supabase) {
    return supabase;
  }

  return checkMemoryRateLimit(key, options);
}
