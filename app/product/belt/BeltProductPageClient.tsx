"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BeltSizeChartModal,
  BeltSizeChartTrigger,
} from "@/app/components/product/BeltSizeChart";
import { resolveBeltSizeChartImage } from "@/app/components/product/beltSizeChartData";
import ProductDetailPage from "@/app/components/product/ProductDetailPage";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import {
  beltVariantOrder,
  type BeltProductSlug,
} from "@/app/components/product/productData";
import type { StorefrontProduct } from "@/lib/products";
import type { ProductVariantRow } from "@/lib/products/types";

const fallbackSizeOptions = ["S", "M", "L", "XL"] as const;

function resolveVariant(value: string | null | undefined): BeltProductSlug {
  return value === "zeus" || value === "berserk" || value === "black"
    ? value
    : "berserk";
}

function normalizeSize(size: string | null | undefined) {
  return size?.trim().toUpperCase() ?? "";
}

function variantForSize(product: StorefrontProduct | null, size: string) {
  return (
    product?.variants.find((variant) => normalizeSize(variant.size) === size) ??
    null
  );
}

function variantIsPurchasable(variant: ProductVariantRow | null) {
  return Boolean(
    variant?.is_active === true && (variant.inventory_quantity ?? 0) > 0,
  );
}

function shortStockLabel(variant: ProductVariantRow | null) {
  if (!variantIsPurchasable(variant)) return "Out";
  const quantity = variant?.inventory_quantity ?? 0;
  return quantity <= 2 ? `${quantity} left` : "In stock";
}

function stockMessageForVariant(variant: ProductVariantRow | null) {
  if (!variantIsPurchasable(variant)) return "Out of stock";
  const quantity = variant?.inventory_quantity ?? 0;
  return quantity <= 2 ? `Only ${quantity} left` : "In stock";
}

function finishLabel(slug: string) {
  if (slug === "zeus") return "Zeus";
  if (slug === "berserk") return "Berserk";
  return "Black";
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
  const searchParams = useSearchParams();
  const activeVariant = resolveVariant(searchParams.get("variant"));
  const [selectedSizeByVariant, setSelectedSizeByVariant] = useState<
    Partial<Record<BeltProductSlug, string>>
  >({});
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const selectedSize = selectedSizeByVariant[activeVariant] ?? "";
  const openSizeChart = useCallback(() => setIsSizeChartOpen(true), []);
  const closeSizeChart = useCallback(() => setIsSizeChartOpen(false), []);

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
    activeProduct?.catalogCategory === "belts"
      ? Array.from(
          new Set([
            ...fallbackSizeOptions,
            ...activeProduct.variants
              .map((variant) => normalizeSize(variant.size))
              .filter(Boolean),
          ]),
        )
      : [...fallbackSizeOptions];

  const selectedVariant = variantForSize(activeProduct, selectedSize);
  const selectedSizeIsPurchasable = variantIsPurchasable(selectedVariant);
  const disabledCtaLabel = selectedSize ? "Size unavailable" : "Select size";

  if (missingEnv || error || products.length === 0 || !activeProduct) {
    return (
      <ProductDetailState
        eyebrow="Lever Belts"
        title={
          !activeProduct && products.length > 0
            ? "This belt variant is not available"
            : "Belt products are temporarily unavailable"
        }
        message={
          !activeProduct && products.length > 0
            ? `Available: ${availableVariants.map(finishLabel).join(", ")}.`
            : "Please check back soon for the latest FORGE lever belts."
        }
      />
    );
  }

  const variantSelector = (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
            Finish
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableVariants.map((variant) => {
            const selected = activeVariant === variant;
            return (
              <button
                key={variant}
                type="button"
                onClick={() => router.replace(`/product/belt?variant=${variant}`)}
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                  selected
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-white/12 text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {finishLabel(variant)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
            Size
          </p>
          <BeltSizeChartTrigger onOpen={openSizeChart} />
        </div>
        <p className="mb-3 text-[0.7rem] leading-5 text-white/40">
          Measure at the navel. Between sizes? Size down for a firmer brace.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {sizeOptions.map((size) => {
            const sizeVariant = variantForSize(activeProduct, size);
            const purchasable = variantIsPurchasable(sizeVariant);
            const selected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                disabled={!purchasable}
                title={stockMessageForVariant(sizeVariant)}
                onClick={() => {
                  if (!purchasable) return;
                  setSelectedSizeByVariant((current) => ({
                    ...current,
                    [activeVariant]: size,
                  }));
                }}
                className={`relative min-h-[3.5rem] border px-2 py-2 text-center transition-colors ${
                  !purchasable
                    ? "cursor-not-allowed border-white/[0.06] text-white/25"
                    : selected
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-white/12 text-white hover:border-white/35"
                }`}
              >
                <span className="block text-sm font-black tracking-[0.12em]">
                  {size}
                </span>
                <span
                  className={`mt-0.5 block text-[0.58rem] font-semibold uppercase tracking-[0.08em] ${
                    selected ? "text-white/80" : "text-white/35"
                  }`}
                >
                  {shortStockLabel(sizeVariant)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const moreFinishes = (
    <section className="border-t border-white/[0.06] bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/45">Other finishes</p>
        <div className="flex flex-wrap gap-2">
          {products
            .filter((product) => product.slug !== activeProduct.slug)
            .map((product) => (
              <Link
                key={product.slug}
                href={product.href}
                className="rounded-full border border-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                {finishLabel(product.slug)}
              </Link>
            ))}
          <Link
            href="/product/straps"
            className="rounded-full border border-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Straps
          </Link>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <ProductDetailPage
        key={activeProduct.slug}
        product={activeProduct}
        extraPanel={variantSelector}
        bottomSection={moreFinishes}
        addToCartDisabled={!selectedSize || !selectedSizeIsPurchasable}
        disabledCtaLabel={disabledCtaLabel}
        validateAddToCart={(quantity) => {
          if (!selectedSize) return "Please select a size";
          if (!selectedSizeIsPurchasable) {
            return `${activeProduct.name} - ${selectedSize} is out of stock`;
          }
          const inventoryQuantity = selectedVariant?.inventory_quantity ?? 0;
          if (quantity > inventoryQuantity) {
            return `Only ${inventoryQuantity} ${selectedSize} left in stock`;
          }
          return null;
        }}
        resolveCartItem={() => ({
          slug: activeProduct.slug,
          variantId: selectedVariant?.id,
          size: selectedSize,
          cartKey: `${activeProduct.slug}-${selectedSize.toLowerCase()}`,
          name: `${activeProduct.name} - ${selectedSize}`,
          href: activeProduct.href,
          images: activeProduct.images,
        })}
      />
      <BeltSizeChartModal
        isOpen={isSizeChartOpen}
        onClose={closeSizeChart}
        imageSrc={resolveBeltSizeChartImage(activeProduct)}
        productName={activeProduct.name}
        availableSizes={
          activeProduct.availableSizes.length > 0
            ? activeProduct.availableSizes
            : [...sizeOptions]
        }
      />
    </>
  );
}
