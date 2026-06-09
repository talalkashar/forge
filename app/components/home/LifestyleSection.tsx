import AnimatedRedBackground from "@/components/ui/animated-red-background";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import Reveal from "@/components/ui/reveal";
import { getFeaturedStorefrontProducts } from "@/lib/products";
import ProductCollectionState from "../product/ProductCollectionState";

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Reveal className="mb-8 max-w-3xl">
      <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-[500px] text-base leading-7 tracking-[0.01em] text-gray-400/85 sm:text-lg">
        {description}
      </p>
    </Reveal>
  );
}

export default async function LifestyleSection() {
  const { data: featuredProducts, error, missingEnv } =
    await getFeaturedStorefrontProducts();

  return (
    <div className="bg-gradient-to-b from-black via-[#050505] to-neutral-950">
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-30 blur-[22px]">
          <AnimatedRedBackground />
        </div>

        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              eyebrow="Store"
              title="The Essentials"
              description="Everything you need. Nothing you don’t."
            />

            {missingEnv ? (
              <ProductCollectionState
                eyebrow="Featured Gear"
                title="Featured products are temporarily unavailable"
                message="Please check back soon for the latest FORGE belts and wrist straps."
              />
            ) : error ? (
              <ProductCollectionState
                eyebrow="Featured Gear"
                title="Featured products are temporarily unavailable"
                message="Please check back soon for the latest FORGE belts and wrist straps."
              />
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {featuredProducts.map((product, index) => (
                  <Reveal
                    key={product.slug}
                    className="h-full"
                    delayMs={index * 90}
                  >
                    <ProductRevealCard
                      name={product.name}
                      image={product.images[0]}
                      price={`$${product.price}`}
                      originalPrice={product.originalPrice}
                      description={product.description}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      detailHref={product.href}
                      className="h-full"
                    />
                  </Reveal>
                ))}
              </div>
            ) : (
              <ProductCollectionState
                eyebrow="Featured Gear"
                title="Featured products are coming soon"
                message="Please check back soon for the latest FORGE belts and wrist straps."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
