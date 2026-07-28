import type { Metadata } from "next";
import ShopCatalogPage from "../../components/product/ShopCatalogPage";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Wrist Straps & Lifting Straps",
  description:
    "Shop FORGE GYM heavy-duty wrist straps for deadlifts, rows, pull-ups, and high-volume pull days. Padded support, non-slip grip.",
  path: "/shop/wrist-straps",
  ogImage: "/images/straps/listing/gallery-v4-1.webp",
  ogImageAlt: "FORGE GYM heavy-duty lifting wrist straps",
  keywords: [
    "lifting straps",
    "wrist straps",
    "deadlift straps",
    "FORGE wrist straps",
  ],
});

export default function WristStrapsCategoryPage() {
  return <ShopCatalogPage category="straps" />;
}
