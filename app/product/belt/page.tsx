import type { Metadata } from "next";
import { Suspense } from "react";
import ProductDetailLoading from "@/app/components/product/ProductDetailLoading";
import RelatedProducts from "@/app/components/product/RelatedProducts";
import Footer from "@/app/components/home/Footer";
import Navbar from "@/app/components/home/Navbar";
import BeltProductPageClient from "./BeltProductPageClient";
import {
  getBeltStorefrontProducts,
  getStorefrontProductBySlug,
} from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lever Belt",
  description:
    "Shop FORGE GYM lever belts with size availability and secure checkout.",
};

async function BeltProductPageContent() {
  const [{ data: products, error, missingEnv }, straps] = await Promise.all([
    getBeltStorefrontProducts(),
    getStorefrontProductBySlug("straps"),
  ]);

  const related = straps.data ? [straps.data] : [];

  return (
    <>
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
