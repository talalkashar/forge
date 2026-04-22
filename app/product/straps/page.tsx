import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ProductDetailPage from "../../components/product/ProductDetailPage";
import { strapProduct } from "../../components/product/productData";

const InActionSection = dynamic(() => import("../../components/home/InActionSection"));

export const metadata: Metadata = {
  title: "Wrist Straps | FORGE",
  description: "FORGE wrist straps built for deadlifts, rows, and higher-volume pull sessions.",
};

export default function StrapsProductPage() {
  return <ProductDetailPage product={strapProduct} bottomSection={<InActionSection />} />;
}
