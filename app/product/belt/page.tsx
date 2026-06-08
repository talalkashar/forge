import type { Metadata } from "next";
import BeltProductPageClient from "./BeltProductPageClient";
import { getBeltStorefrontProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lever Belt | FORGE",
  description:
    "Shop FORGE lever belts with live size availability and secure checkout.",
};

export default async function BeltProductPage() {
  const { data: products, error, missingEnv } = await getBeltStorefrontProducts();

  return (
    <BeltProductPageClient
      products={products}
      error={error}
      missingEnv={missingEnv}
    />
  );
}
