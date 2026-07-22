import "server-only";

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

  // Hard cap: drop expired first, then oldest half if still over limit.
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
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in production.
 * Falls back to in-memory if unset or if Upstash errors.
 */
async function checkUpstashRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redisKey = `forge:rl:${key}`;
  const windowSec = Math.max(1, Math.ceil(options.windowMs / 1000));

  try {
    // INCR then EXPIRE only on first hit (when count === 1).
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
 * Sync in-memory limiter (fast path / local dev).
 * Prefer `checkRateLimitAsync` on public APIs in production.
 */
export function checkRateLimit(key: string, options: RateLimitOptions) {
  return checkMemoryRateLimit(key, options);
}

/**
 * Async limiter: Upstash when configured, otherwise memory.
 * Use on checkout, search, and admin login.
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const durable = await checkUpstashRateLimit(key, options);
  if (durable) {
    return durable;
  }
  return checkMemoryRateLimit(key, options);
}
