import type { Metadata } from "next";
import ShopCatalogPage from "../../components/product/ShopCatalogPage";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "10mm Lever Belts",
  description:
    "Shop FORGE GYM 10mm lever belts for heavy squats, deadlifts, and locked-in bracing. Berserk, Zeus, and Black finishes.",
  path: "/shop/belts",
  ogImage: "/images/belts/listing/berserk/main.jpg",
  ogImageAlt: "FORGE GYM Berserk 10mm lever weightlifting belt",
  keywords: [
    "10mm lever belt",
    "powerlifting belt",
    "weight lifting belt",
    "FORGE lever belt",
  ],
});

export default function BeltsCategoryPage() {
  return <ShopCatalogPage category="belts" />;
}
