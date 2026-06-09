import { NextResponse } from "next/server";
import { getStorefrontProducts } from "@/lib/products";
import { searchProducts, toProductSearchItem } from "@/lib/product-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? 6);
  const { data: products, error } = await getStorefrontProducts();

  if (error) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  return NextResponse.json({
    products: searchProducts(
      products.map(toProductSearchItem),
      query,
      Number.isFinite(limit) ? limit : 6,
    ),
  });
}
