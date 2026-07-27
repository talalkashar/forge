import type { Metadata } from "next";
import { Suspense } from "react";
import ProductDetailLoading from "@/app/components/product/ProductDetailLoading";
import RelatedProducts from "@/app/components/product/RelatedProducts";
import Footer from "@/app/components/home/Footer";
import Navbar from "@/app/components/home/Navbar";
import JsonLd from "@/app/components/site/JsonLd";
import BeltProductPageClient from "./BeltProductPageClient";
import {
  getBeltStorefrontProducts,
  getStorefrontProductBySlug,
} from "@/lib/products";
import { productPresentationBySlug } from "@/app/components/product/productData";
import { buildPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "10mm Lever Belts — Berserk, Zeus & Black",
  description:
    "Shop FORGE GYM 10mm lever weightlifting belts with steel lever buckle. Choose Berserk, Zeus, or Black. Size availability and secure Stripe checkout.",
  path: "/product/belt",
  ogImage: "/images/belts/listing/berserk/main.jpg",
  ogImageAlt: "FORGE GYM 10mm lever weightlifting belts",
  keywords: [
    "10mm lever belt",
    "powerlifting belt",
    "Berserk lever belt",
    "Zeus lever belt",
    "weight lifting belt",
  ],
});

/** Product schema only — no review stars (marketing copy is not verified aggregate ratings). */
function beltProductJsonLd() {
  const beltSlugs = ["berserk", "zeus", "black"] as const;

  const products = beltSlugs.map((slug) => {
    const p = productPresentationBySlug[slug];
    const name =
      slug === "berserk"
        ? "FORGE Berserk Lever Belt"
        : slug === "zeus"
          ? "FORGE Zeus Lever Belt"
          : "FORGE Black Lever Belt";

    return {
      "@type": "Product",
      name,
      description: p.description,
      image: p.images.map((src) => `${site.url}${src}`),
      brand: {
        "@type": "Brand",
        name: site.name,
      },
      category: "Sporting Goods > Strength Training > Weightlifting Belts",
      material: "Leather",
      color:
        slug === "black" ? "Black" : slug === "zeus" ? "Zeus" : "Berserk",
      offers: {
        "@type": "Offer",
        url: `${site.url}/product/belt?variant=${slug}`,
        priceCurrency: "USD",
        price: "79.97",
        itemCondition: "https://schema.org/NewCondition",
        // Availability is inventory-driven in Supabase — omit rather than invent.
        seller: {
          "@type": "Organization",
          name: site.name,
        },
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": products,
  };
}

async function BeltProductPageContent() {
  const [{ data: products, error, missingEnv }, straps] = await Promise.all([
    getBeltStorefrontProducts(),
    getStorefrontProductBySlug("straps"),
  ]);

  const related = straps.data ? [straps.data] : [];

  return (
    <>
      <JsonLd data={beltProductJsonLd()} />
      <BeltProductPageClient
        products={products}
        error={error}
        missingEnv={missingEnv}
      />
      {related.length > 0 ? (
        <RelatedProducts products={related} title="Add wrist straps" />
      ) : null}
    </>
  );
}

export default function BeltProductPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="h-16 sm:h-20" />
          <main>
            <section className="bg-black px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
              <ProductDetailLoading />
            </section>
          </main>
          <Footer />
        </>
      }
    >
      <BeltProductPageContent />
    </Suspense>
  );
}
