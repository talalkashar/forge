import BeltProductPageClient from "./BeltProductPageClient";
import { getBeltStorefrontProducts } from "@/lib/products";

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
