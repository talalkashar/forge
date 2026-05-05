"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star, Heart } from "lucide-react";
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
  onFavorite?: () => void;
  enableAnimations?: boolean;
  className?: string;
}

function ProductRevealCardComponent({
  name = "Premium Wireless Headphones",
  price = "$199",
  originalPrice = "$299",
  image = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=600&fit=crop",
  description = "Experience studio-quality sound with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  rating = 4.8,
  reviewCount = 124,
  detailHref = "/shop",
  onFavorite,
  enableAnimations = true,
  className,
}: ProductRevealCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const handleFavorite = () => {
    setIsFavorite((current) => !current);
    onFavorite?.();
  };

  const containerVariants: Variants = {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: shouldAnimate
      ? {
          scale: 1.02,
          y: -8,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          },
        }
      : {},
  };

  const imageVariants: Variants = {
    rest: { scale: 1 },
    hover: shouldAnimate ? { scale: 1.08 } : {},
  };

  const overlayVariants: Variants = {
    rest: {
      y: "8%",
      opacity: 0,
    },
    hover: shouldAnimate
      ? {
          y: "0%",
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.6,
            staggerChildren: 0.08,
            delayChildren: 0.08,
          },
        }
      : {},
  };

  const contentVariants: Variants = {
    rest: {
      opacity: 0,
      y: 14,
    },
    hover: shouldAnimate
      ? {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.5,
          },
        }
      : {},
  };

  const buttonMotionVariants: Variants = {
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate
      ? {
          scale: 1.03,
          y: -2,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
        }
      : {},
    tap: shouldAnimate ? { scale: 0.97 } : {},
  };

  const favoriteVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    favorite: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const parsePrice = (value?: string) => {
    if (!value) {
      return null;
    }

    const normalized = value.replace(/[^0-9.]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const numericPrice = parsePrice(price);
  const numericOriginalPrice = parsePrice(originalPrice);
  const discount =
    numericPrice !== null &&
    numericOriginalPrice !== null &&
    numericOriginalPrice > numericPrice &&
    numericOriginalPrice > 0
      ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
      : null;
  const showDiscountBadge =
    discount !== null && discount > 0 && discount < 50;

  const navigateToDetails = () => {
    router.push(detailHref);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a,button")) {
      return;
    }

    navigateToDetails();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a,button")) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToDetails();
    }
  };

  return (
    <motion.article
      data-slot="product-reveal-card"
      initial="rest"
      whileHover="hover"
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(19,19,19,0.98),rgba(5,5,5,1))] text-white shadow-[0_20px_56px_rgba(0,0,0,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70",
        className,
      )}
      variants={containerVariants}
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_42%),linear-gradient(180deg,rgba(20,20,20,0.95),rgba(8,8,8,1))]">
        <motion.div
          className="relative h-full w-full"
          variants={imageVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={70}
            className="object-contain p-6"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <motion.button
          type="button"
          onClick={handleFavorite}
          variants={favoriteVariants}
          animate={isFavorite ? "favorite" : "rest"}
          className={cn(
            "absolute right-4 top-4 rounded-full border border-white/15 p-2 text-white backdrop-blur-sm transition-colors",
            isFavorite ? "bg-red-600" : "bg-black/35 hover:bg-black/55",
          )}
          aria-label={`Favorite ${name}`}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </motion.button>

        {showDiscountBadge ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white"
          >
            {discount}% OFF
          </motion.div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <Star
                key={`${name}-star-${index}`}
                className={cn(
                  "h-4 w-4",
                  index < Math.round(rating)
                    ? "fill-current text-yellow-400"
                    : "text-white/25",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-white/60">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        <div className="min-h-[5.5rem] space-y-2">
          <motion.h3
            className="text-2xl font-black leading-tight tracking-[-0.04em]"
            initial={{ opacity: 0.92 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {name}
          </motion.h3>

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

        <div className="mt-auto space-y-3 pt-6 md:hidden">
          <Link
            href={detailHref}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            View Details
          </Link>
        </div>
      </div>

      <motion.div
        variants={overlayVariants}
        className="absolute inset-x-0 bottom-0 hidden bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.92)_24%,rgba(0,0,0,0.97)_100%)] p-6 md:block"
      >
        <motion.div variants={contentVariants} className="space-y-4">
          <div>
            <p className="text-sm leading-6 text-white/70">{description}</p>
          </div>
        </motion.div>

        <motion.div variants={contentVariants} className="mt-5 space-y-3">
          <motion.div
            variants={buttonMotionVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href={detailHref}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              View Details
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

ProductRevealCardComponent.displayName = "ProductRevealCard";

export const ProductRevealCard = memo(ProductRevealCardComponent);
