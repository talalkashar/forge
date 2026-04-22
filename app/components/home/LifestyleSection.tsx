"use client";

import { motion } from "framer-motion";
import AnimatedRedBackground from "@/components/ui/animated-red-background";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { products } from "../product/productData";

const featuredProducts = products.filter((product) =>
  ["zeus", "berserk", "straps"].includes(product.slug),
);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-8 max-w-3xl"
    >
      <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-[500px] text-base leading-7 tracking-[0.01em] text-gray-400/85 sm:text-lg">
        {description}
      </p>
    </motion.div>
  );
}

export default function LifestyleSection() {
  return (
    <div className="bg-gradient-to-b from-black via-[#050505] to-neutral-950">
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-[30px]">
          <AnimatedRedBackground />
        </div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              eyebrow="Store"
              title="The Essentials"
              description="Everything you need. Nothing you don’t."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.12 }}
                  className="h-full"
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
