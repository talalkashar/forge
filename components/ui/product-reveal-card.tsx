"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductRevealCardProps {
  name?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  detailHref?: string;
  className?: string;
}

function parsePrice(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ProductRevealCard({
  name = "Premium Wireless Headphones",
  price = "$199",
  originalPrice = "$299",
  image = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=600&fit=crop",
  description = "Experience studio-quality sound with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  detailHref = "/shop",
  className,
}: ProductRevealCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const numericPrice = parsePrice(price);
  const numericOriginalPrice = parsePrice(originalPrice);
  const discount =
    numericPrice !== null &&
    numericOriginalPrice !== null &&
    numericOriginalPrice > numericPrice &&
    numericOriginalPrice > 0
      ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
      : null;
  const showDiscountBadge = discount !== null && discount > 0 && discount < 50;

  return (
    <article
      data-slot="product-reveal-card"
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,19,19,0.98),rgba(5,5,5,1))] text-white shadow-[0_16px_44px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/14 hover:shadow-[0_22px_54px_rgba(0,0,0,0.34)]",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.14),transparent_40%),linear-gradient(180deg,rgba(20,20,20,0.95),rgba(8,8,8,1))]">
        <div className="relative h-full w-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            quality={70}
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <button
          type="button"
          onClick={() => setIsFavorite((current) => !current)}
          className={cn(
            "absolute right-4 top-4 z-10 rounded-full border border-white/12 p-2 text-white backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 hover:scale-105",
            isFavorite ? "border-red-500/70 bg-red-600 text-white" : "bg-black/35 hover:bg-black/55",
          )}
          aria-label={`Favorite ${name}`}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>

        {showDiscountBadge ? (
          <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white">
            {discount}% OFF
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="min-h-[5.5rem] space-y-2">
          <h3 className="text-2xl font-black leading-tight tracking-[-0.04em] text-white">
            {name}
          </h3>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-red-500">{price}</span>
            {originalPrice ? (
              <span className="text-base text-white/40 line-through">
                {originalPrice}
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/62">
          {description}
        </p>

        <div className="mt-auto pt-6">
          <Link
            href={detailHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full border-white/12 bg-white/[0.02] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]",
            )}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
