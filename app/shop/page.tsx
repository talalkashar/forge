import type { Metadata } from "next";
import ShopCatalogPage from "../components/product/ShopCatalogPage";

export const metadata: Metadata = {
  title: "Shop | FORGE",
  description: "Browse the current FORGE lineup of lifting belts and wrist straps.",
};

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;

  return <ShopCatalogPage category={rawCategory} />;
}
