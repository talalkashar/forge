import type { Metadata } from "next";
import ShopCatalogPage from "../../components/product/ShopCatalogPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wrist Straps",
  description: "Shop FORGE wrist straps built for deadlifts, rows, pull-ups, and heavy pull days.",
};

export default function WristStrapsCategoryPage() {
  return <ShopCatalogPage category="straps" />;
}
