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
  const productShots = product.images.filter(
    (src) => !src.includes("/lifestyle/"),
  );
  const pool = productShots.length > 0 ? productShots : product.images;
  // Prefer curated main.jpg (then card.jpg) in listing folders for consistent cards
  const primary = pool[0];
  let hero: string | null = null;
  if (primary && primary.includes("/listing/")) {
    const mainGuess = primary.replace(/\/[^/]+$/, "/main.jpg");
    const cardGuess = primary.replace(/\/[^/]+$/, "/card.jpg");
    hero = mainGuess || cardGuess;
    // prefer main path string; file existence is guaranteed by asset pipeline
    if (primary.includes("/main.jpg") || primary.includes("/card.jpg")) {
      hero = primary.includes("/main.jpg") ? primary : primary.replace(/card\.jpg$/, "main.jpg");
    } else {
      hero = mainGuess;
    }
  }
  const primaryOut = hero ?? primary;
  return {
    primary: primaryOut,
    secondary:
      pool.find((src) => src !== primaryOut && src !== primary) ??
      product.images.find((src) => src !== primaryOut) ??
      null,
  };
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
  const availableSizes = Array.from(
    new Set(
      sizedVariants
        .filter((variant) => (variant.inventory_quantity ?? 0) > 0)
        .map((variant) => formatSize(variant.size))
        .filter((size): size is string => Boolean(size)),
    ),
  );

  return (
    <article
      className="group flex h-full flex-col overflow-hidden border border-white/[0.08] bg-black transition-colors duration-150 hover:border-white/25"
      onMouseEnter={() => {
        if (secondary) setShowSecondary(true);
      }}
      onMouseLeave={() => setShowSecondary(false)}
    >
      <Link
        href={product.href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
      >
        <div className="relative aspect-square overflow-hidden bg-black">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(90,12,12,0.2),transparent_58%)]"
            aria-hidden="true"
          />
          {primary ? (
            <Image
              src={primary}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 360px"
              quality={86}
              className={`object-contain p-1.5 transition-opacity duration-200 sm:p-2 ${
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
              quality={86}
              loading="lazy"
              className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.03] sm:p-2"
              aria-hidden="true"
            />
          ) : null}

          {isOutOfStock ? (
            <span className="absolute left-3 top-3 border border-amber-400/30 bg-black/80 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-amber-200">
              Sold out
            </span>
          ) : (
            <span className="absolute left-3 top-3 border border-emerald-400/25 bg-black/80 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-emerald-300/90">
              In stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white/40">
            {product.category}
          </p>
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
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
                        ? "border-white/15 text-white/75"
                        : "border-white/8 text-white/25 line-through"
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
                isOutOfStock ? "text-amber-300/90" : "text-white/40"
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
                <span className="text-sm text-white/30 line-through">
                  {product.originalPrice}
                </span>
              ) : null}
            </div>
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/45 transition-colors group-hover:text-white">
              Shop →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
