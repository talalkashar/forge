"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductDetailPage from "@/app/components/product/ProductDetailPage";
import ProductDetailState from "@/app/components/product/ProductDetailState";
import { beltVariantOrder, type BeltProductSlug } from "@/app/components/product/productData";
import type { StorefrontProduct } from "@/lib/products";
import type { ProductVariantRow } from "@/lib/products/types";

const fallbackSizeOptions = ["S", "M", "L", "XL"] as const;

function resolveVariant(value: string | null | undefined): BeltProductSlug {
  return value === "zeus" || value === "berserk" || value === "black"
    ? value
    : "zeus";
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

function stockMessageForVariant(variant: ProductVariantRow | null) {
  if (!variant) {
    return "Out of stock";
  }

  if (!variantIsPurchasable(variant)) {
    return "Out of stock";
  }

  const quantity = variant.inventory_quantity ?? 0;

  return quantity <= 2 ? `Only ${quantity} left in stock` : "In stock";
}

function shortStockLabel(variant: ProductVariantRow | null) {
  if (!variantIsPurchasable(variant)) {
    return "Out of stock";
  }

  const quantity = variant?.inventory_quantity ?? 0;

  return quantity <= 2 ? `${quantity} left` : "In stock";
}

function variantStyleNote(slug: string) {
  if (slug === "zeus") {
    return "Statement finish with the same FORGE lever belt platform.";
  }

  if (slug === "berserk") {
    return "Bold finish with the same FORGE lever belt platform.";
  }

  return "Minimal black finish with the same FORGE lever belt platform.";
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
    activeProduct?.catalogCategory === "belts"
      ? Array.from(
          new Set([
            ...fallbackSizeOptions,
            ...activeProduct.variants
              .map((variant) => normalizeSize(variant.size))
              .filter(Boolean),
          ]),
        )
      : fallbackSizeOptions;
  const selectedVariant = variantForSize(activeProduct, selectedSize);
  const selectedSizeIsPurchasable = variantIsPurchasable(selectedVariant);
  const selectedStockMessage = selectedSize
    ? stockMessageForVariant(selectedVariant)
    : "Select a size to see live stock";
  const disabledCtaLabel = selectedSize ? "Select in-stock size" : "Select size";

  if (missingEnv) {
    return (
      <ProductDetailState
        eyebrow="Lever Belts"
        title="Belt products are temporarily unavailable"
        message="Please check back soon for the latest FORGE lever belts."
      />
    );
  }

  if (error) {
    return (
      <ProductDetailState
        eyebrow="Lever Belts"
        title="Belt products are temporarily unavailable"
        message="Please check back soon for the latest FORGE lever belts."
      />
    );
  }

  if (products.length === 0) {
    return (
      <ProductDetailState
        eyebrow="Lever Belts"
        title="Belt products are coming soon"
        message="Please check back soon for the latest FORGE lever belts."
      />
    );
  }

  if (!activeProduct) {
    return (
      <ProductDetailState
        eyebrow="Variant Unavailable"
        title="This belt variant is not live"
        message={`The requested ${activeVariant} variant is not currently available. Available variants: ${availableVariants.join(", ")}.`}
      />
    );
  }

  const beltComparisonSection = (
    <section className="bg-black px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
            Compare Belts
          </p>
          <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
            Same lever platform. Pick the finish that fits your setup.
          </h2>
          <p className="mt-4 text-sm leading-6 text-gray-400 sm:text-base">
            Every listed FORGE belt keeps the current $79.97 belt price and live
            size inventory from Supabase. Choose by finish, size availability,
            and stock.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => {
            const activeSizes = product.availableSizes.length > 0
              ? product.availableSizes.join(", ")
              : "Check product page";
            const stockLabel =
              product.inventoryQuantity > 0
                ? `${product.inventoryQuantity} total in stock`
                : "Out of stock";

            return (
              <article
                key={product.slug}
                className={`rounded-[1.5rem] border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] ${
                  product.slug === activeProduct.slug
                    ? "border-red-600/45 bg-red-950/20"
                    : "border-white/8 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                      {product.slug}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-white">
                      {product.name}
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-white">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-400">
                  {variantStyleNote(product.slug)}
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 rounded-xl bg-black/35 px-4 py-3">
                    <dt className="text-gray-500">Sizes</dt>
                    <dd className="text-right font-semibold text-white">{activeSizes}</dd>
                  </div>
                  <div className="flex justify-between gap-4 rounded-xl bg-black/35 px-4 py-3">
                    <dt className="text-gray-500">Stock</dt>
                    <dd className="text-right font-semibold text-white">{stockLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-4 rounded-xl bg-black/35 px-4 py-3">
                    <dt className="text-gray-500">Closure</dt>
                    <dd className="font-semibold text-white">Lever</dd>
                  </div>
                </dl>
                <Link
                  href={product.href}
                  className="mt-5 inline-flex rounded-full border border-red-600/50 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/12"
                >
                  View this belt
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(5,5,5,1))] p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                Complete Your Setup
              </p>
              <h3 className="text-2xl font-black text-white">
                Add straps for pull days.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                Belts support bracing. Straps support grip on heavy pulls. Add
                FORGE Lifting Straps only if they fit your training needs.
              </p>
            </div>
            <Link
              href="/product/straps"
              className="inline-flex justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
            >
              View Straps - $9.99
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  const variantSelector = (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
              Variant
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Choose the belt finish first, then select a live size.
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
            Live inventory
          </span>
        </div>
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
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
              Size
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Unavailable sizes are locked until restock.
            </p>
          </div>
          <p className="text-right text-xs font-semibold text-gray-500">
            Inventory updates by size.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sizeOptions.map((size) => {
              const sizeVariant = variantForSize(activeProduct, size);
              const sizeIsPurchasable = variantIsPurchasable(sizeVariant);
              const sizeIsSelected = selectedSize === size;
              const stockLabel = shortStockLabel(sizeVariant);
              const sizeButtonClass = sizeIsPurchasable
                ? sizeIsSelected
                  ? "border-red-600 bg-red-600 text-white shadow-[0_16px_34px_rgba(220,38,38,0.2)]"
                  : "border-white/10 bg-neutral-900 text-gray-300 hover:border-red-600/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                : "cursor-not-allowed border-white/8 bg-[linear-gradient(180deg,rgba(20,20,20,0.78),rgba(8,8,8,0.92))] text-white/28 opacity-75";

              return (
                <button
                  key={size}
                  type="button"
                  title={stockMessageForVariant(sizeVariant)}
                  aria-disabled={!sizeIsPurchasable}
                  disabled={!sizeIsPurchasable}
                  className={`relative min-h-[4.75rem] overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all ${sizeButtonClass}`}
                  onClick={() => {
                    if (!sizeIsPurchasable) {
                      return;
                    }

                    setSelectedSize(size);
                  }}
                >
                  {!sizeIsPurchasable ? (
                    <span
                      className="pointer-events-none absolute inset-x-3 top-1/2 h-px -rotate-12 bg-white/18"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="block text-lg font-black uppercase tracking-[0.14em]">
                    {size}
                  </span>
                  <span
                    className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.66rem] font-black uppercase tracking-[0.08em] ${
                      sizeIsPurchasable
                        ? "border-white/10 bg-black/20 text-white/75"
                        : "border-red-950/60 bg-red-950/35 text-red-200/55"
                    }`}
                  >
                    {stockLabel}
                  </span>
                </button>
              );
            })}
        </div>
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            !selectedSize
              ? "border-white/8 bg-white/[0.03] text-gray-400"
              : selectedSizeIsPurchasable
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                : "border-red-600/25 bg-red-950/30 text-red-200"
          }`}
        >
          {selectedSize ? `Size ${selectedSize}: ${selectedStockMessage}` : selectedStockMessage}
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">
          Measure around your waist where the belt will sit, usually around the navel.
          Do not use your pants size.
        </p>
      </div>
    </div>
  );

  return (
    <ProductDetailPage
      key={activeProduct.slug}
      product={activeProduct}
      extraPanel={variantSelector}
      bottomSection={beltComparisonSection}
      addToCartDisabled={!selectedSize || !selectedSizeIsPurchasable}
      disabledCtaLabel={disabledCtaLabel}
      validateAddToCart={(quantity) => {
        if (!selectedSize) {
          return "Please select a size";
        }

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
  );
}
