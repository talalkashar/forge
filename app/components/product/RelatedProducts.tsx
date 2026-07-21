import Image from "next/image";
import Link from "next/link";
import type { StorefrontProduct } from "@/lib/products";

export default function RelatedProducts({
  products,
  title = "You may also need",
}: {
  products: StorefrontProduct[];
  title?: string;
}) {
  if (!products.length) return null;

  return (
    <section className="border-t border-white/[0.06] bg-black px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <Link
            href="/shop"
            className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white"
          >
            Shop all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const image = product.images[0];
            return (
              <Link
                key={product.slug}
                href={product.href}
                className="group flex gap-4 border border-white/[0.08] bg-[#080808] p-3 transition-colors hover:border-white/25"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-white/[0.06] bg-[#080808]">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="96px"
                      quality={82}
                      className="object-contain p-1.5"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/35">
                    {product.category}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-black text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-white/80">
                    ${product.price.toFixed(2)}
                  </p>
                  <span className="mt-2 inline-flex text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/40 transition-colors group-hover:text-red-400">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
