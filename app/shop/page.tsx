import type { Metadata } from "next";
import ShopCatalogPage from "../components/product/ShopCatalogPage";

export const metadata: Metadata = {
  title: "Shop | FORGE",
  description: "Browse the current FORGE lineup of lifting belts and wrist straps.",
};

export default function ShopPage() {
  return <ShopCatalogPage />;
}
