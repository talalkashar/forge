import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import RelatedProducts from "@/app/components/product/RelatedProducts";
import JsonLd from "@/app/components/site/JsonLd";
import {
  getBeltStorefrontProducts,
  getStorefrontProductBySlug,
} from "@/lib/products";
import { productPresentationBySlug } from "@/app/components/product/productData";
import { buildPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import StrapsProductPageClient from "./StrapsProductPageClient";

const InActionSection = nextDynamic(() =>
  import("../../components/home/InActionSection").then((mod) => mod.default),
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Heavy-Duty Wrist Straps",
  description:
    "FORGE GYM heavy-duty lifting straps with padded wrist support and non-slip grip. Built for deadlifts, rows, and high-volume pull sessions.",
  path: "/product/straps",
  ogImage: "/images/straps/listing/gallery-v4-1.webp",
  ogImageAlt: "FORGE GYM heavy-duty lifting wrist straps",
  keywords: [
    "lifting straps",
    "wrist straps",
    "deadlift straps",
    "FORGE wrist straps",
  ],
});

function strapsProductJsonLd() {
  const p = productPresentationBySlug.straps;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "FORGE Heavy-Duty Lifting Straps",
    description: p.description,
    image: p.images.map((src) => `${site.url}${src}`),
    brand: {
      "@type": "Brand",
      name: site.name,
    },
    category: "Sporting Goods > Strength Training > Lifting Straps",
    color: "Black",
    offers: {
      "@type": "Offer",
      url: `${site.url}/product/straps`,
      priceCurrency: "USD",
      price: "9.99",
      itemCondition: "https://schema.org/NewCondition",
      // Availability is inventory-driven in Supabase — omit rather than invent.
      seller: {
        "@type": "Organization",
        name: site.name,
      },
    },
  };
}

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
    <>
      <JsonLd data={strapsProductJsonLd()} />
      <StrapsProductPageClient
        product={product}
        bottomSection={
          <>
            <RelatedProducts products={related} title="Pair with a lever belt" />
            <InActionSection />
          </>
        }
      />
    </>
  );
}
