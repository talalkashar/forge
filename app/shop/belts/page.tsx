import type { Metadata } from "next";
import ShopCatalogPage from "../../components/product/ShopCatalogPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lever Belts",
  description: "Shop FORGE lever belts built for heavy squats, deadlifts, and locked-in bracing.",
};

export default function BeltsCategoryPage() {
  return <ShopCatalogPage category="belts" />;
}
