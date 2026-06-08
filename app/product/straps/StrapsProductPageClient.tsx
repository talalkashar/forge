"use client";

import type { ReactNode } from "react";
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

  return (
    <ProductDetailPage
      product={product}
      bottomSection={bottomSection}
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
