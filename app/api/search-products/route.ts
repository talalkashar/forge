import { NextResponse } from "next/server";
import { getStorefrontProducts } from "@/lib/products";
import { searchProducts, toProductSearchItem } from "@/lib/product-search";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";

const searchRateLimit = {
  limit: 90,
  windowMs: 60 * 1000,
};

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(
    `search:${clientIp(request.headers)}`,
    searchRateLimit,
  );

  if (rateLimit.limited) {
    return NextResponse.json(
      { products: [] },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").slice(0, 120);
  const requestedLimit = Number(searchParams.get("limit") ?? 6);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 12)
    : 6;
  const { data: products, error } = await getStorefrontProducts();

  if (error) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  return NextResponse.json({
    products: searchProducts(
      products.map(toProductSearchItem),
      query,
      limit,
    ),
  });
}
