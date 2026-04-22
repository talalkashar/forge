"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductDetailPage from "../../components/product/ProductDetailPage";
import {
  beltBaseProduct,
  beltDescriptionGalleryBySlug,
  products,
  type BeltProductSlug,
  type ProductDetailConfig,
} from "../../components/product/productData";

const variantOrder: BeltProductSlug[] = ["zeus", "berserk", "black"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"] as const;

function BeltProductPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const currentVariant = searchParams.get("variant");
  const activeVariant: BeltProductSlug =
    currentVariant === "zeus" || currentVariant === "berserk" || currentVariant === "black"
      ? currentVariant
      : "zeus";

  const activeCatalogProduct = useMemo(
    () => products.find((product) => product.slug === activeVariant),
    [activeVariant],
  );

  const product = useMemo<ProductDetailConfig>(
    () => ({
      ...beltBaseProduct,
      slug: activeCatalogProduct?.slug ?? "zeus",
      name: activeCatalogProduct?.name ?? "Zeus Lever Belt",
      images: activeCatalogProduct?.images ?? [],
      href: activeCatalogProduct?.href ?? "/product/belt?variant=zeus",
      buyNowUrl: "/cart",
      descriptionGalleryImages: beltDescriptionGalleryBySlug[activeVariant],
      reviews: beltBaseProduct.reviews as ProductDetailConfig["reviews"],
      specificationGroups:
        beltBaseProduct.specificationGroups as ProductDetailConfig["specificationGroups"],
    }),
    [activeCatalogProduct, activeVariant],
  );

  const variantSelector = (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
          Variant
        </p>
        <div className="flex flex-wrap gap-3">
          {variantOrder.map((variant) => (
            <button
              key={variant}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition-all ${
                activeVariant === variant
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-white/10 bg-neutral-900 text-gray-300 hover:border-red-600/70 hover:text-white"
              }`}
              onClick={() => router.replace(`/product/belt?variant=${variant}`)}
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
      key={activeVariant}
      product={product}
      extraPanel={variantSelector}
      addToCartDisabled={!selectedSize}
      validateAddToCart={() => (selectedSize ? null : "Please select a size")}
      resolveCartItem={() => ({
        slug: product.slug,
        cartKey: `${product.slug}-${selectedSize.toLowerCase()}`,
        name: `${product.name} - ${selectedSize}`,
        href: product.href,
        images: product.images,
      })}
    />
  );
}

export default function BeltProductPage() {
  return (
    <Suspense fallback={null}>
      <BeltProductPageContent />
    </Suspense>
  );
}
