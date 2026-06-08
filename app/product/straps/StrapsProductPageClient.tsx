"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ProductDetailPage from "@/app/components/product/ProductDetailPage";
import type { StorefrontProduct } from "@/lib/products";

function getPrimaryVariant(product: StorefrontProduct) {
  return (
    product.variants.find((variant) => variant.is_active === true) ??
    product.variants[0] ??
    null
  );
}

export default function StrapsProductPageClient({
  product,
  bottomSection,
}: {
  product: StorefrontProduct;
  bottomSection?: ReactNode;
}) {
  const variant = getPrimaryVariant(product);
  const inventoryQuantity = variant?.inventory_quantity ?? 0;
  const isPurchasable = Boolean(variant?.is_active === true && inventoryQuantity > 0);
  const stockMessage = isPurchasable
    ? inventoryQuantity <= 5
      ? `Only ${inventoryQuantity} left in stock`
      : "In stock"
    : "Out of stock";
  const stockTone = isPurchasable
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
    : "border-red-600/25 bg-red-950/30 text-red-200";
  const strapsConversionSection = (
    <>
      <section className="bg-black px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(5,5,5,1))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                Gear Pairing
              </p>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                Straps are for grip. Belts are for bracing.
              </h2>
              <p className="mt-4 text-sm leading-6 text-gray-400 sm:text-base">
                Use straps when grip is limiting your pull work. Use a lever
                belt when you want a consistent brace on heavy compound lifts.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/35 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
                  FORGE Lifting Straps
                </p>
                <h3 className="mt-2 text-xl font-black text-white">$9.99</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  For deadlifts, rows, RDLs, pull-ups, and higher-volume pull
                  sessions where grip fatigue ends the set first.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/35 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
                  FORGE Lever Belts
                </p>
                <h3 className="mt-2 text-xl font-black text-white">$79.97</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  For squats, deadlifts, and loaded strength work where bracing
                  support matters more than grip support.
                </p>
                <Link
                  href="/product/belt"
                  className="mt-5 inline-flex rounded-full border border-red-600/50 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/12"
                >
                  Compare belts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {bottomSection}
    </>
  );

  return (
    <ProductDetailPage
      product={product}
      bottomSection={strapsConversionSection}
      addToCartDisabled={!isPurchasable}
      extraPanel={
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
                Stock
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Inventory is checked again before Stripe checkout.
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${stockTone}`}>
              {stockMessage}
            </span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-gray-300">
            One black straps variant is currently managed in the live FORGE catalog.
            Quantity limits are enforced against the current inventory before checkout.
          </div>
        </div>
      }
      validateAddToCart={(quantity) => {
        if (!isPurchasable) {
          return "FORGE Lifting Straps are out of stock";
        }

        if (quantity > inventoryQuantity) {
          return `Only ${inventoryQuantity} FORGE Lifting Straps left in stock`;
        }

        return null;
      }}
      resolveCartItem={() => ({
        slug: product.slug,
        variantId: variant?.id,
        cartKey: variant?.sku ?? product.slug,
        name: product.name,
        href: product.href,
        images: product.images,
      })}
    />
  );
}
