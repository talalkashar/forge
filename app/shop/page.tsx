import type { Metadata } from "next";
import ShopCatalogPage from "../components/product/ShopCatalogPage";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop Lever Belts & Wrist Straps",
  description:
    "Browse FORGE GYM 10mm lever belts and heavy-duty wrist straps. Choose Berserk, Zeus, or Black finishes and checkout securely with Stripe.",
  path: "/shop",
  keywords: [
    "shop lever belts",
    "powerlifting belt",
    "lifting straps",
    "FORGE GYM shop",
  ],
});

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
