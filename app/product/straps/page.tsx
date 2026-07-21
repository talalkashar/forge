import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import RelatedProducts from "@/app/components/product/RelatedProducts";
import {
  getBeltStorefrontProducts,
  getStorefrontProductBySlug,
} from "@/lib/products";
import StrapsProductPageClient from "./StrapsProductPageClient";

const InActionSection = nextDynamic(() =>
  import("../../components/home/InActionSection").then((mod) => mod.default),
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wrist Straps",
  description:
    "FORGE GYM wrist straps built for deadlifts, rows, and higher-volume pull sessions.",
};

export default async function StrapsProductPage() {
  const [{ data: product }, belts] = await Promise.all([
    getStorefrontProductBySlug("straps"),
    getBeltStorefrontProducts(),
  ]);

  if (!product) {
    return (
      <ProductDetailState
        eyebrow="Product Unavailable"
        title="Wrist straps are not live right now"
        message="Please check back soon for the latest FORGE GYM wrist straps."
      />
    );
  }

  const related = (belts.data ?? []).slice(0, 3);

  return (
    <StrapsProductPageClient
      product={product}
      bottomSection={
        <>
          <RelatedProducts products={related} title="Pair with a lever belt" />
          <InActionSection />
        </>
      }
    />
  );
}
