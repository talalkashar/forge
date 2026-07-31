import { NextResponse } from "next/server";
import {
  buildMetaCatalogItems,
  metaCatalogToCsv,
} from "@/lib/meta-catalog";
import { getStorefrontProducts } from "@/lib/products";
import {
  checkRateLimitAsync,
  clientIp,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const feedRateLimit = {
  limit: 30,
  windowMs: 60 * 1000,
};

function authorized(request: Request): boolean {
  const expected = process.env.META_CATALOG_FEED_TOKEN?.trim();
  // No token configured → public feed (OK for Meta scheduled fetch after domain claim).
  if (!expected) return true;

  const { searchParams } = new URL(request.url);
  const fromQuery = searchParams.get("token")?.trim();
  if (fromQuery && fromQuery === expected) return true;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const bearer = auth.slice(7).trim();
    if (bearer === expected) return true;
  }

  return false;
}

/**
 * Meta Commerce Manager product feed (CSV).
 *
 * Production URL:
 *   https://forgegym.us/api/feeds/meta-catalog
 * Optional lock:
 *   https://forgegym.us/api/feeds/meta-catalog?token=YOUR_META_CATALOG_FEED_TOKEN
 *
 * Connect this URL in Meta Commerce Manager → Catalog → Data sources → Scheduled feed.
 * Checkout stays on forgegym.us (Stripe). This feed only lists products for IG/FB tags.
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimitAsync(
    `meta-catalog:${clientIp(request.headers)}`,
    feedRateLimit,
  );

  if (rateLimit.limited) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfter) },
    });
  }

  const { data: products, error } = await getStorefrontProducts();

  if (error && products.length === 0) {
    return new NextResponse("Catalog unavailable", { status: 503 });
  }

  // Only rows with real active SKUs (buildMetaCatalogItems skips offline zero-SKU junk).
  const items = buildMetaCatalogItems(products);
  const csv = metaCatalogToCsv(items);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-FORGE-Catalog-Items": String(items.length),
    },
  });
}
