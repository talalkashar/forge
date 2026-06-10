import Image from "next/image";
import Link from "next/link";
import type { StorefrontProduct } from "@/lib/products";

function getActiveVariants(product: StorefrontProduct) {
  return product.variants.filter((variant) => variant.is_active === true);
}

function formatSize(size: string | null) {
  return size?.trim().toUpperCase() ?? null;
}

export default function ProductCard({ product }: { product: StorefrontProduct }) {
  const mainImage =
    product.slug === "berserk"
      ? "/images/belts/listing/berserk/1.webp"
      : product.images[0];
  const activeVariants = getActiveVariants(product);
  const sizedVariants = activeVariants.filter((variant) => formatSize(variant.size));
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
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,21,0.98),rgba(5,5,5,1))] shadow-[0_18px_52px_rgba(0,0,0,0.3)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-red-600/45 hover:shadow-[0_24px_68px_rgba(0,0,0,0.38)]">
      <Link
        href={product.href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
      >
        <div className="relative aspect-[4/5] overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.18),transparent_40%),linear-gradient(180deg,rgba(22,22,22,0.95),rgba(8,8,8,1))]">
          <div className="absolute inset-x-8 bottom-8 h-10 rounded-full bg-red-600/18 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            quality={75}
            className="object-contain p-6 drop-shadow-[0_22px_34px_rgba(0,0,0,0.42)] transition-[transform,filter] duration-500 group-hover:scale-[1.04] group-hover:brightness-105"
          />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-red-500/90">
            {product.category}
          </p>
          <h2 className="min-h-[3.4rem] text-2xl font-black leading-tight tracking-normal text-white">
            {product.name}
          </h2>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-400">
            {product.description}
          </p>

          {sizedVariants.length > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-white/45">
                {availableSizes.length > 0 ? "Available Sizes" : "Sizes"}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizedVariants.map((variant) => {
                  const size = formatSize(variant.size);
                  const hasStock = (variant.inventory_quantity ?? 0) > 0;

                  return (
                    <span
                      key={variant.id}
                      className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${
                        hasStock
                          ? "border-red-600/45 bg-red-600/12 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/35 line-through"
                      }`}
                    >
                      {hasStock ? size : `${size} Out`}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <p
              className={`mt-5 text-xs font-bold uppercase tracking-[0.16em] ${
                isOutOfStock ? "text-amber-300" : "text-red-400"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </p>
          )}

          <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/8 pt-5">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black tracking-normal text-red-500">
                  ${product.price}
                </span>
                {product.originalPrice ? (
                  <span className="text-base text-white/35 line-through">
                    {product.originalPrice}
                  </span>
                ) : null}
              </div>
            </div>

            <span className="inline-flex shrink-0 rounded-full border border-red-600/40 bg-red-600/0 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-[transform,border-color,background-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:border-red-500 group-hover:bg-red-600/12 group-hover:shadow-[0_12px_28px_rgba(220,38,38,0.14)]">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
