"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@/lib/products";

function getActiveVariants(product: StorefrontProduct) {
  return product.variants.filter((variant) => variant.is_active === true);
}

function formatSize(size: string | null) {
  return size?.trim().toUpperCase() ?? null;
}

function galleryShots(product: StorefrontProduct) {
  // Always use the curated gallery order from product data (images[0] hero).
  // Never rewrite to main.jpg/card.jpg, or shop/home/PDP can disagree.
  const productShots = product.images.filter(
    (src) => !src.includes("/lifestyle/"),
  );
  const pool = productShots.length > 0 ? productShots : product.images;
  const primary = pool[0] ?? null;
  const secondary =
    pool.find((src) => src !== primary) ??
    product.images.find((src) => src !== primary) ??
    null;
  return { primary, secondary };
}

export default function ProductCard({
  product,
}: {
  product: StorefrontProduct;
}) {
  const { primary, secondary } = useMemo(() => galleryShots(product), [product]);
  const [showSecondary, setShowSecondary] = useState(false);
  const activeVariants = getActiveVariants(product);
  const sizedVariants = activeVariants.filter((variant) =>
    formatSize(variant.size),
  );
  const inStockVariants = activeVariants.filter(
    (variant) => (variant.inventory_quantity ?? 0) > 0,
  );
  const isOutOfStock = inStockVariants.length === 0;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden border border-white/[0.1] bg-[#080808] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-red-500/45 hover:shadow-[0_0_0_1px_rgba(220,38,38,0.18),0_18px_50px_rgba(0,0,0,0.55)]"
      onMouseEnter={() => {
        if (secondary) setShowSecondary(true);
      }}
      onMouseLeave={() => setShowSecondary(false)}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent transition-opacity duration-200 group-hover:via-red-500/70"
        aria-hidden="true"
      />
      <Link
        href={product.href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
      >
        <div className="relative aspect-square overflow-hidden bg-black">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(110,14,14,0.28),transparent_58%)]"
            aria-hidden="true"
          />
          {primary ? (
            <Image
              src={primary}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 360px"
              quality={90}
              className={`object-contain p-2 transition-opacity duration-200 sm:p-2.5 ${
                showSecondary && secondary ? "opacity-0" : "opacity-100"
              }`}
            />
          ) : null}

          {showSecondary && secondary ? (
            <Image
              src={secondary}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 360px"
              quality={90}
              loading="lazy"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.05] sm:p-2.5"
              aria-hidden="true"
            />
          ) : null}

          {isOutOfStock ? (
            <span className="absolute left-3 top-3 border border-amber-400/30 bg-black/80 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-amber-200">
              Sold out
            </span>
          ) : (
            <span className="absolute left-3 top-3 border border-emerald-400/30 bg-black/80 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-emerald-200">
              In stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col border-t border-white/[0.06] p-5 sm:p-6">
          <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white/80">
            {product.category}
          </p>
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/85">
            {product.description}
          </p>

          {sizedVariants.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {sizedVariants.map((variant) => {
                const size = formatSize(variant.size);
                const hasStock = (variant.inventory_quantity ?? 0) > 0;

                return (
                  <span
                    key={variant.id}
                    className={`border px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide ${
                      hasStock
                        ? "border-white/25 text-white"
                        : "border-white/10 text-white/40 line-through"
                    }`}
                  >
                    {size}
                  </span>
                );
              })}
            </div>
          ) : (
            <p
              className={`mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
                isOutOfStock ? "text-amber-300" : "text-white/80"
              }`}
            >
              {isOutOfStock ? "Out of stock" : "In stock"}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice ? (
                <span className="text-sm text-white/50 line-through">
                  {product.originalPrice}
                </span>
              ) : null}
            </div>
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white transition-opacity group-hover:opacity-80">
              Shop →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
