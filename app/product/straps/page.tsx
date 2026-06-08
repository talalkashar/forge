import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import { getStorefrontProductBySlug } from "@/lib/products";
import StrapsProductPageClient from "./StrapsProductPageClient";

const InActionSection = nextDynamic(() => import("../../components/home/InActionSection"));

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wrist Straps | FORGE",
  description: "FORGE wrist straps built for deadlifts, rows, and higher-volume pull sessions.",
};

export default async function StrapsProductPage() {
  const { data: product, error, missingEnv } = await getStorefrontProductBySlug("straps");

  if (missingEnv) {
    return (
      <ProductDetailState
        eyebrow="Wrist Straps"
        title="Wrist straps are temporarily unavailable"
        message="Please check back soon for the latest FORGE wrist straps."
      />
    );
  }

  if (error) {
    return (
      <ProductDetailState
        eyebrow="Wrist Straps"
        title="Wrist straps are temporarily unavailable"
        message="Please check back soon for the latest FORGE wrist straps."
      />
    );
  }

  if (!product) {
    return (
      <ProductDetailState
        eyebrow="Product Unavailable"
        title="Wrist straps are not live right now"
        message="Please check back soon for the latest FORGE wrist straps."
      />
    );
  }

  return (
    <StrapsProductPageClient
      product={product}
      bottomSection={<InActionSection />}
    />
  );
}
