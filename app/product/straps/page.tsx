import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import { getStorefrontProductBySlug } from "@/lib/products";
import ProductDetailPage from "../../components/product/ProductDetailPage";

const InActionSection = dynamic(() => import("../../components/home/InActionSection"));

export const metadata: Metadata = {
  title: "Wrist Straps | FORGE",
  description: "FORGE wrist straps built for deadlifts, rows, and higher-volume pull sessions.",
};

export default async function StrapsProductPage() {
  const { data: product, error, missingEnv } = await getStorefrontProductBySlug("straps");

  if (missingEnv) {
    return (
      <ProductDetailState
        eyebrow="Catalog Offline"
        title="Supabase config is missing"
        message="Add the Supabase environment variables to load the live straps product."
      />
    );
  }

  if (error) {
    return (
      <ProductDetailState
        eyebrow="Catalog Error"
        title="Could not load wrist straps"
        message={error}
      />
    );
  }

  if (!product) {
    return (
      <ProductDetailState
        eyebrow="Product Unavailable"
        title="Wrist straps are not live right now"
        message="This route is now backed by the Supabase products table, and no straps product is currently available there."
      />
    );
  }

  return <ProductDetailPage product={product} bottomSection={<InActionSection />} />;
}
