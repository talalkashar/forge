"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCatalogItem } from "./productData";

function ProductCard({ product }: { product: ProductCatalogItem }) {
  const mainImage = product.images[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] shadow-[0_18px_52px_rgba(0,0,0,0.32)] transition-transform duration-300 hover:-translate-y-1 hover:border-red-600/45">
      <Link
        href={product.href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
      >
        <div className="relative aspect-[4/5] overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_42%),linear-gradient(180deg,rgba(18,18,18,0.95),rgba(8,8,8,1))]">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            quality={70}
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-red-500/90">
            {product.category}
          </p>
          <h2 className="min-h-[3.5rem] text-2xl font-black leading-tight tracking-[-0.04em] text-white">
            {product.name}
          </h2>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-400">
            {product.description}
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-red-500">
                  ${product.price}
                </span>
                {product.originalPrice ? (
                  <span className="text-base text-white/35 line-through">
                    {product.originalPrice}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {product.rating} rating • {product.reviewCount} reviews
              </p>
            </div>

            <span className="inline-flex rounded-full border border-red-600/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 group-hover:border-red-500 group-hover:bg-red-600/10">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

ProductCard.displayName = "ProductCard";

export default memo(ProductCard);
