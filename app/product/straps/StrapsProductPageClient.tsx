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
  const isPurchasable = Boolean(
    variant?.is_active === true && inventoryQuantity > 0,
  );
  const stockMessage = isPurchasable
    ? inventoryQuantity <= 5
      ? `Only ${inventoryQuantity} left`
      : "In stock"
    : "Out of stock";

  const bottom = (
    <>
      <section className="border-t border-white/[0.06] bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-red-400">
              FORGE GYM
            </p>
            <p className="mt-2 text-sm text-white/50">
              Need bracing too? Shop lever belts.
            </p>
          </div>
          <Link
            href="/product/belt?variant=berserk"
            className="inline-flex w-fit rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-white/35"
          >
            Shop belts →
          </Link>
        </div>
      </section>
      {bottomSection}
    </>
  );

  return (
    <ProductDetailPage
      product={product}
      bottomSection={bottom}
      addToCartDisabled={!isPurchasable}
      extraPanel={
        <div className="flex items-center justify-between gap-3 border border-white/[0.08] px-4 py-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/40">
              Stock
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{stockMessage}</p>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${
              isPurchasable ? "bg-emerald-400" : "bg-red-500"
            }`}
            aria-hidden="true"
          />
        </div>
      }
      validateAddToCart={(quantity) => {
        if (!isPurchasable) {
          return "FORGE GYM Lifting Straps are out of stock";
        }
        if (quantity > inventoryQuantity) {
          return `Only ${inventoryQuantity} left in stock`;
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
