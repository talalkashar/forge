"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import type { StorefrontProduct } from "@/lib/products";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "../home/Footer";
import Navbar from "../home/Navbar";
import {
  BELT_SIZE_CHART_BETWEEN_SIZES,
  BELT_SIZE_CHART_MEASURE_TIP,
  BELT_SIZE_CHART_ROWS,
  resolveBeltSizeChartImage,
} from "./beltSizeChartData";
import ProductReviewsPanel from "./ProductReviewsPanel";
import TikTokShopLink from "./TikTokShopLink";
import { FixedPortal } from "@/app/components/providers/FixedPortal";

function isEditorialGalleryImage(image: string) {
  return image.includes("/lifestyle/");
}

function galleryImagePosition(image: string) {
  if (image.includes("zeus-belt-worn-front")) return "center 62%";
  if (image.includes("zeus-belt-lift-angle")) return "center 58%";
  if (image.includes("deadlift")) return "center 46%";
  if (image.includes("front-detail")) return "center 44%";
  if (image.includes("bench-detail")) return "center 50%";
  return "center";
}

export default function ProductDetailPage({
  product,
  extraPanel,
  bottomSection,
  validateAddToCart,
  addToCartDisabled = false,
  disabledCtaLabel,
  resolveCartItem,
}: {
  product: StorefrontProduct;
  extraPanel?: ReactNode;
  bottomSection?: ReactNode;
  validateAddToCart?: (quantity: number) => string | null;
  addToCartDisabled?: boolean;
  disabledCtaLabel?: string;
  resolveCartItem?: () => {
    slug: string;
    name: string;
    cartKey?: string;
    href?: string;
    images?: string[];
    variantId?: string;
    size?: string;
  };
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [notification, setNotification] = useState("");
  const notificationTimeoutRef = useRef<number | null>(null);

  const currentImage = useMemo(
    () => product.images[currentImageIndex] ?? product.images[0],
    [currentImageIndex, product.images],
  );
  const currentImageLabel =
    product.imageAlts?.[currentImageIndex] ??
    `${product.name} image ${currentImageIndex + 1}`;
  const currentImageIsEditorial = isEditorialGalleryImage(currentImage);
  const isStraps = product.slug === "straps";
  const disabledPurchaseLabel =
    disabledCtaLabel ?? (isStraps ? "Out of stock" : "Select size");
  const categoryLabel =
    product.catalogCategory === "straps" ? "Wrist Straps" : "Lever Belts";
  const categoryHref =
    product.catalogCategory === "straps" ? "/shop/wrist-straps" : "/shop/belts";
  const beltSizeChartImage = !isStraps ? resolveBeltSizeChartImage(product) : null;

  const clearNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
  }, []);

  const queueNotification = useCallback(
    (message: string) => {
      clearNotification();
      setNotification(message);
      notificationTimeoutRef.current = window.setTimeout(() => {
        setNotification("");
        notificationTimeoutRef.current = null;
      }, 2800);
    },
    [clearNotification],
  );

  useEffect(() => clearNotification, [clearNotification]);

  useEffect(() => {
    if (!isZoomed) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isZoomed]);

  const updateImage = useCallback(
    (nextIndex: number) => {
      if (product.images.length === 0) return;
      if (nextIndex < 0) {
        setCurrentImageIndex(product.images.length - 1);
        return;
      }
      if (nextIndex >= product.images.length) {
        setCurrentImageIndex(0);
        return;
      }
      setCurrentImageIndex(nextIndex);
    },
    [product.images.length],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") updateImage(currentImageIndex - 1);
      if (event.key === "ArrowRight") updateImage(currentImageIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentImageIndex, updateImage]);

  const addSelectedItemToCart = useCallback(() => {
    try {
      const validationError = validateAddToCart?.(quantity);
      if (validationError) {
        queueNotification(validationError);
        return false;
      }

      const cartItem = resolveCartItem?.() ?? {
        slug: product.slug,
        name: product.cartName,
      };

      addToCart({
        slug: cartItem.slug,
        cartKey: cartItem.cartKey,
        variantId: cartItem.variantId,
        size: cartItem.size,
        name: cartItem.name,
        price: product.price,
        quantity,
        images: cartItem.images ?? product.images,
        href: cartItem.href ?? product.href,
      });
      queueNotification("Added to cart");
      return true;
    } catch {
      queueNotification("Cart unavailable");
      return false;
    }
  }, [
    addToCart,
    product.cartName,
    product.href,
    product.images,
    product.price,
    product.slug,
    quantity,
    queueNotification,
    resolveCartItem,
    validateAddToCart,
  ]);

  const handleBuyNow = () => {
    if (addSelectedItemToCart()) {
      router.push("/cart");
    }
  };

  const coreSpecs = isStraps
    ? [
        ["Type", "Wrist straps"],
        ["Set", "Pair"],
        ["Material", "Cotton blend + neoprene"],
      ]
    : [
        ["Brand", "FORGE GYM"],
        ["Thickness", "10mm"],
        ["Closure", "Lever"],
      ];

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black pb-20 sm:pb-0">
        <section className="relative overflow-hidden px-4 pb-28 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
          {/* Ambient stage , CSS only, no WebGL hang risk */}
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden="true"
          >
            <div className="absolute -left-1/4 top-0 h-[40rem] w-[40rem] rounded-full bg-red-700/15 blur-[120px]" />
            <div className="absolute -right-1/4 top-1/3 h-[36rem] w-[36rem] rounded-full bg-red-950/40 blur-[130px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.04),transparent_45%)]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <Breadcrumb className="mb-6 sm:mb-8">
              <BreadcrumbList className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                <BreadcrumbItem>
                  <BreadcrumbLink className="hover:text-white" href="/">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/20" />
                <BreadcrumbItem>
                  <BreadcrumbLink className="hover:text-white" href={categoryHref}>
                    {categoryLabel}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/20" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
              {/* Gallery */}
              <div className="lg:col-span-7">
                <div className="group relative overflow-hidden border border-white/[0.08] bg-black">
                  <div className="relative aspect-square">
                    <div
                      className="absolute inset-0 bg-black"
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      className="absolute inset-0 cursor-zoom-in"
                      onClick={() => setIsZoomed(true)}
                      aria-label="Open fullscreen image"
                    >
                      <Image
                        key={currentImage}
                        src={currentImage}
                        alt={currentImageLabel}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        quality={86}
                        style={{
                          objectPosition: currentImageIsEditorial
                            ? galleryImagePosition(currentImage)
                            : "center",
                        }}
                        className={
                          currentImageIsEditorial
                            ? "object-cover"
                            : "object-contain p-5 sm:p-8"
                        }
                        draggable={false}
                      />
                    </button>

                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 border border-white/10 bg-black/55 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white/55 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 sm:bottom-4">
                      Click to expand
                    </div>

                    <button
                      type="button"
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 border border-white/15 bg-black/70 p-2.5 text-white transition-colors hover:bg-black/90 sm:left-4"
                      onClick={() => updateImage(currentImageIndex - 1)}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 border border-white/15 bg-black/70 p-2.5 text-white transition-colors hover:bg-black/90 sm:right-4"
                      onClick={() => updateImage(currentImageIndex + 1)}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="absolute bottom-3 left-3 border border-white/10 bg-black/55 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-white/75 backdrop-blur-sm sm:bottom-4 sm:left-4">
                      {currentImageIndex + 1} of {product.images.length}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 sm:mt-3">
                  {product.images.map((image, index) => {
                    const editorial = isEditorialGalleryImage(image);
                    const selected = index === currentImageIndex;
                    return (
                      <button
                        key={image}
                        type="button"
                        aria-label={`Image ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative aspect-square h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden border bg-black transition-[border-color] duration-200 sm:h-auto sm:w-auto ${
                          selected
                            ? "border-white/60"
                            : "border-white/[0.08] hover:border-white/30"
                        }`}
                      >
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="72px"
                          quality={86}
                          style={{
                            objectPosition: editorial
                              ? galleryImagePosition(image)
                              : "center",
                          }}
                          className={
                            editorial ? "object-cover" : "object-contain p-1"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buy panel */}
              <div className="lg:col-span-5">
                <div className="border border-white/[0.08] bg-black p-5 sm:p-7 lg:sticky lg:top-24">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-red-400">
                    {product.kicker}
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
                    {product.name}
                  </h1>
                  {product.reviewCount > 0 ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                      {Number(product.rating).toFixed(1)} ★ · {product.reviewCount} reviews
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-baseline gap-3">
                    <p className="text-2xl font-black text-white">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.originalPrice ? (
                      <p className="text-base text-white/30 line-through">
                        {product.originalPrice}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                    {product.intro}
                  </p>

                  {product.featureList?.length ? (
                    <ul className="mt-4 space-y-1.5 text-sm text-white/50">
                      {product.featureList.slice(0, 4).map((f) => (
                        <li key={f} className="flex gap-2">
                          <span className="text-red-500" aria-hidden="true">
                            /
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <dl className="mt-6 grid grid-cols-3 gap-2 border-y border-white/[0.08] py-4">
                    {coreSpecs.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white/35">
                          {label}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-4 grid grid-cols-2 gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white/45">
                    <li className="border border-white/[0.07] px-3 py-2">Secure Stripe checkout</li>
                    <li className="border border-white/[0.07] px-3 py-2">Tracked US shipping</li>
                    <li className="border border-white/[0.07] px-3 py-2">Size guide below</li>
                    <li className="border border-white/[0.07] px-3 py-2">30-day returns policy</li>
                  </ul>

                  {extraPanel ? <div className="mt-6">{extraPanel}</div> : null}

                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex items-center border border-white/12">
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center text-lg text-white transition-colors hover:bg-white/5"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center text-lg text-white transition-colors hover:bg-white/5"
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <motion.button
                      type="button"
                      onClick={() => addSelectedItemToCart()}
                      disabled={addToCartDisabled}
                      whileTap={addToCartDisabled || prefersReducedMotion ? undefined : { scale: 0.98 }}
                      className={`w-full rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.16em] transition-colors ${
                        addToCartDisabled
                          ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
                          : "bg-red-600 text-white hover:bg-red-500"
                      }`}
                    >
                      {addToCartDisabled ? disabledPurchaseLabel : "Add to cart"}
                    </motion.button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={addToCartDisabled}
                      className={`w-full rounded-full border px-6 py-3.5 text-sm font-black uppercase tracking-[0.16em] transition-colors ${
                        addToCartDisabled
                          ? "cursor-not-allowed border-white/[0.08] text-white/25"
                          : "border-white/20 text-white hover:border-white/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      Buy now
                    </button>
                  </div>

                  <p className="mt-4 text-center text-xs text-white/35">
                    Secure checkout via Stripe ·{" "}
                    <Link href="/shipping" className="underline-offset-2 hover:text-white/60 hover:underline">
                      Shipping
                    </Link>
                    {" · "}
                    <Link href="/returns" className="underline-offset-2 hover:text-white/60 hover:underline">
                      Returns
                    </Link>
                  </p>
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <TikTokShopLink slug={product.slug} />
                    <p className="text-center text-[0.62rem] leading-5 text-white/30">
                      Stock follows TikTok Shop for this product family.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact details , one collapsible area instead of five sections */}
            <div className="mt-14 border-t border-white/[0.08] pt-10 sm:mt-16 sm:pt-12">
              {!isStraps && beltSizeChartImage ? (
                <div className="mb-10 grid gap-8 lg:grid-cols-2 lg:items-start">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Size guide
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                      {BELT_SIZE_CHART_MEASURE_TIP} {BELT_SIZE_CHART_BETWEEN_SIZES}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-red-400/90">
                      Tip: most lifters size down for a firmer brace.
                    </p>
                    <ul className="mt-5 space-y-2 text-sm text-white/65">
                      {BELT_SIZE_CHART_ROWS.map((row) => (
                        <li
                          key={row.size}
                          className="flex justify-between border-b border-white/[0.06] py-2"
                        >
                          <span className="font-bold text-white">{row.size}</span>
                          <span>{row.inches}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative aspect-[5/4] overflow-hidden border border-white/[0.08] bg-neutral-950">
                    <Image
                      src={beltSizeChartImage}
                      alt={`${product.name} size chart`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={86}
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setDetailsOpen((open) => !open)}
                className="flex w-full items-center justify-between border border-white/[0.08] px-5 py-4 text-left transition-colors hover:border-white/20"
              >
                <span className="text-sm font-black uppercase tracking-[0.16em] text-white">
                  Specs & details
                </span>
                <span className="text-white/50" aria-hidden="true">
                  {detailsOpen ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {detailsOpen ? (
                  <motion.div
                    initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-t-0 border-white/[0.08] bg-black p-5 sm:p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {product.specificationGroups.map((group) => (
                          <div key={group.title}>
                            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                              {group.title}
                            </h3>
                            {group.rows ? (
                              <ul className="mt-3 space-y-2 text-sm">
                                {group.rows.map(([label, value]) => (
                                  <li
                                    key={label}
                                    className="flex justify-between gap-4 border-b border-white/[0.05] py-2 text-white/70"
                                  >
                                    <span className="text-white/40">{label}</span>
                                    <span className="text-right font-medium text-white">
                                      {value}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <ul className="mt-3 space-y-2 text-sm text-white/65">
                                {group.bullets?.map((bullet) => (
                                  <li key={bullet}>• {bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {product.reviews.length > 0 ? (
          <section className="border-t border-white/[0.06] bg-[#050505] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <ProductReviewsPanel reviews={product.reviews} />
            </div>
          </section>
        ) : null}

        {bottomSection}
      </main>
      <Footer />

      <FixedPortal>
      <AnimatePresence>
        {notification ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-24 right-4 z-50 border border-white/10 bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-2xl sm:bottom-8"
          >
            {notification}
          </motion.div>
        ) : null}
      </AnimatePresence>


      <AnimatePresence>
        {isZoomed ? (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen product image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-[112] border border-white/15 bg-black/60 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white"
              onClick={() => setIsZoomed(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-[112] -translate-y-1/2 border border-white/15 bg-black/60 p-3 text-white sm:left-6"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation();
                updateImage(currentImageIndex - 1);
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-[112] -translate-y-1/2 border border-white/15 bg-black/60 p-3 text-white sm:right-6"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation();
                updateImage(currentImageIndex + 1);
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <motion.div
              className="relative h-[min(88vh,900px)] w-full max-w-5xl"
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={currentImage}
                alt={currentImageLabel}
                fill
                sizes="100vw"
                quality={86}
                style={{
                  objectPosition: currentImageIsEditorial
                    ? galleryImagePosition(currentImage)
                    : "center",
                }}
                className={
                  currentImageIsEditorial
                    ? "object-contain"
                    : "object-contain p-4"
                }
              />
            </motion.div>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/50">
              {currentImageIndex + 1} of {product.images.length}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {(product.catalogCategory === "belts" ||
        product.catalogCategory === "straps") && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{product.name}</p>
              <p className="text-sm font-bold text-white/70">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => addSelectedItemToCart()}
              disabled={addToCartDisabled}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.12em] ${
                addToCartDisabled
                  ? "border border-white/10 text-white/35"
                  : "bg-red-600 text-white"
              }`}
            >
              {addToCartDisabled ? disabledPurchaseLabel : "Add"}
            </button>
          </div>
        </div>
      )}
      </FixedPortal>
    </>
  );
}
