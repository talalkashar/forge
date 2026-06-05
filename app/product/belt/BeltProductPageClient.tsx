"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductDetailPage from "@/app/components/product/ProductDetailPage";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import { beltVariantOrder, type BeltProductSlug } from "@/app/components/product/productData";
import type { StorefrontProduct } from "@/lib/products";

const fallbackSizeOptions = ["S", "M", "L", "XL"] as const;

function resolveVariant(value: string | null | undefined): BeltProductSlug {
  return value === "zeus" || value === "berserk" || value === "black"
    ? value
    : "zeus";
}

export default function BeltProductPageClient({
  products,
  error,
  missingEnv,
}: {
  products: StorefrontProduct[];
  error: string | null;
  missingEnv: boolean;
}) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeVariant, setActiveVariant] = useState<BeltProductSlug>(() => {
    if (typeof window === "undefined") {
      return "zeus";
    }

    return resolveVariant(new URLSearchParams(window.location.search).get("variant"));
  });

  const activeProduct = useMemo(
    () => products.find((product) => product.slug === activeVariant) ?? null,
    [activeVariant, products],
  );

  const availableVariants = useMemo(
    () =>
      beltVariantOrder.filter((variant) =>
        products.some((product) => product.slug === variant),
      ),
    [products],
  );
  const sizeOptions =
    activeProduct?.availableSizes.length ? activeProduct.availableSizes : fallbackSizeOptions;

  if (missingEnv) {
    return (
      <ProductDetailState
        eyebrow="Catalog Offline"
        title="Supabase config is missing"
        message="Add the Supabase environment variables to load live belt products in this route."
      />
    );
  }

  if (error) {
    return (
      <ProductDetailState
        eyebrow="Catalog Error"
        title="Could not load belt products"
        message={error}
      />
    );
  }

  if (products.length === 0) {
    return (
      <ProductDetailState
        eyebrow="Catalog Empty"
        title="No belt products are live"
        message="Supabase is connected, but there are currently no belt products available for this route."
      />
    );
  }

  if (!activeProduct) {
    return (
      <ProductDetailState
        eyebrow="Variant Unavailable"
        title="This belt variant is not live"
        message={`The requested ${activeVariant} variant is not currently present in the Supabase products table. Available variants: ${availableVariants.join(", ")}.`}
      />
    );
  }

  const variantSelector = (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
          Variant
        </p>
        <div className="flex flex-wrap gap-3">
          {availableVariants.map((variant) => (
            <button
              key={variant}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition-all ${
                activeVariant === variant
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-white/10 bg-neutral-900 text-gray-300 hover:border-red-600/70 hover:text-white"
              }`}
              onClick={() => {
                setActiveVariant(variant);
                setSelectedSize("");
                router.replace(`/product/belt?variant=${variant}`);
              }}
            >
              {variant === "zeus" ? "Zeus" : variant === "berserk" ? "Berserk" : "Black"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
          Size
        </p>
        <div className="flex flex-wrap gap-3">
          {sizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              className={`min-w-14 rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition-all ${
                selectedSize === size
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-white/10 bg-neutral-900 text-gray-300 hover:border-red-600/70 hover:text-white"
              }`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ProductDetailPage
      key={activeProduct.slug}
      product={activeProduct}
      extraPanel={variantSelector}
      addToCartDisabled={!selectedSize}
      validateAddToCart={() => (selectedSize ? null : "Please select a size")}
      resolveCartItem={() => ({
        slug: activeProduct.slug,
        cartKey: `${activeProduct.slug}-${selectedSize.toLowerCase()}`,
        name: `${activeProduct.name} - ${selectedSize}`,
        href: activeProduct.href,
        images: activeProduct.images,
      })}
    />
  );
}
