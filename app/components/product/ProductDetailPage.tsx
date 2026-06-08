"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import ProductReviewsPanel from "./ProductReviewsPanel";

type TabName = "description" | "specs" | "reviews";
type FaqItem = [string, ReactNode];

export default function ProductDetailPage({
  product,
  extraPanel,
  bottomSection,
  validateAddToCart,
  addToCartDisabled = false,
  resolveCartItem,
}: {
  product: StorefrontProduct;
  extraPanel?: ReactNode;
  bottomSection?: ReactNode;
  validateAddToCart?: (quantity: number) => string | null;
  addToCartDisabled?: boolean;
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabName>(
    product.slug === "zeus" ? "specs" : "description",
  );
  const [notification, setNotification] = useState("");
  const notificationTimeoutRef = useRef<number | null>(null);
  const currentImage = useMemo(
    () => product.images[currentImageIndex] ?? product.images[0],
    [currentImageIndex, product.images],
  );
  const currentImageLabel =
    product.imageAlts?.[currentImageIndex] ??
    `${product.name} image ${currentImageIndex + 1}`;
  const showStandaloneDescriptionGallery =
    product.slug === "straps" &&
    Array.isArray(product.descriptionGalleryImages) &&
    product.descriptionGalleryImages.length > 0;
  const detailTabs: Array<[TabName, string]> =
    product.slug === "zeus"
      ? [
          ["specs", "Specifications"],
          ["reviews", "Reviews"],
        ]
      : [
          ["description", "Description"],
          ["specs", "Specifications"],
          ["reviews", "Reviews"],
        ];
  const isStraps = product.slug === "straps";
  const sizeGuidance = [
    [
      "Measure where it sits",
      "Measure around your waist where the belt will sit, usually around the navel. Do not use your pants size.",
    ],
    [
      "Brace before deciding",
      "Take the measurement while standing relaxed, then check how the belt position feels when you brace.",
    ],
    [
      "Between sizes",
      "Exact size ranges are being finalized. Contact support if you are between sizes.",
    ],
  ];
  const buyReassurance = isStraps
    ? ["Secure checkout", "Inventory verified before checkout", "Contact support for order help"]
    : ["Secure checkout", "Live stock by size", "Contact support for sizing help"];
  const includedItems = isStraps
    ? ["One pair of FORGE lifting straps"]
    : ["One FORGE lever belt", "Lever hardware"];
  const availabilityMessage = isStraps
    ? product.inventoryQuantity > 0
      ? "In stock"
      : "Out of stock"
    : "Select size for live stock";
  const categoryLabel = product.catalogCategory === "straps" ? "Wrist Straps" : "Lever Belts";
  const categoryHref = product.catalogCategory === "straps" ? "/shop/wrist-straps" : "/shop/belts";
  const beltActiveSizes = product.availableSizes.length > 0
    ? product.availableSizes.join(", ")
    : "Select a size to confirm availability";
  const beltQuickSpecs: Array<[string, string]> = [
    ["Product", "FORGE Lever Belt"],
    ["Price", `$${product.price.toFixed(2)}`],
    ["Sizes", beltActiveSizes],
    ["Closure", "Lever"],
    ["Use", "Strength training"],
    ["Included", "Belt and lever hardware"],
  ];
  const productBenefits = isStraps
    ? [
        ["Grip stays locked", "Textured webbing helps keep heavy pulls from slipping first."],
        ["Wrist comfort", "Padding spreads pressure through longer deadlift, row, and pull-up work."],
        ["Fast setup", "Easy wrap-and-release handling between working sets."],
      ]
    : [
        ["Brace harder", "A structured belt wall gives your core something consistent to press into."],
        ["Lever speed", "Clamp down before the lift and release quickly after the set."],
        ["Heavy-session support", "Built for squats, deadlifts, and loaded compound training."],
      ];
  const faqItems: FaqItem[] = isStraps
    ? [
        ["Are these sold as a pair?", "Yes. The straps product includes one pair."],
        ["What lifts should I use them for?", "Use them for deadlifts, rows, RDLs, pull-ups, and other pull movements where grip fatigue limits the set."],
        ["Will the padding feel bulky?", "The wrist padding is designed to reduce pressure without making the wrap hard to control."],
        [
          "Can I return or exchange them?",
          <>
            Check the{" "}
            <Link className="font-semibold text-red-300 hover:text-red-200" href="/returns">
              returns policy
            </Link>{" "}
            or contact support before ordering.
          </>,
        ],
      ]
    : [
        ["How do I choose my size?", "Measure around your waist where the belt will sit, usually around the navel. Do not use your pants size. Exact size ranges are being finalized, so contact support if you are between sizes."],
        ["Is this for squats and deadlifts?", "Yes. This lever belt is intended for strength training movements where you want more consistent bracing, including squats and deadlifts."],
        ["What if my size is out of stock?", "Choose another available size only if it fits your measured belt position. Otherwise, wait for restock or contact support before ordering."],
        [
          "Can I return or exchange it?",
          <>
            Check the{" "}
            <Link className="font-semibold text-red-300 hover:text-red-200" href="/returns">
              returns policy
            </Link>{" "}
            or contact support before ordering.
          </>,
        ],
      ];

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
      }, 3000);
    },
    [clearNotification],
  );

  useEffect(() => clearNotification, [clearNotification]);

  const updateImage = useCallback((nextIndex: number) => {
    if (nextIndex < 0) {
      setCurrentImageIndex(product.images.length - 1);
      return;
    }

    if (nextIndex >= product.images.length) {
      setCurrentImageIndex(0);
      return;
    }

    setCurrentImageIndex(nextIndex);
  }, [product.images.length]);

  const addSelectedItemToCart = useCallback(() => {
    try {
      const validationError = validateAddToCart?.(quantity);

      if (validationError) {
        window.alert(validationError);
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
      queueNotification(`${cartItem.name} added to cart!`);
      return true;
    } catch {
      queueNotification("Error: Cart system not available");
      return false;
    }
  }, [
    addToCart,
    product.href,
    product.images,
    product.price,
    product.slug,
    product.cartName,
    quantity,
    queueNotification,
    resolveCartItem,
    validateAddToCart,
  ]);

  const handleAddToCart = () => {
    addSelectedItemToCart();
  };

  const handleBuyNow = () => {
    const didAddToCart = addSelectedItemToCart();

    if (didAddToCart) {
      router.push("/cart");
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main>
        <section className="bg-black px-4 pb-28 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb className="mb-8">
              <BreadcrumbList className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <BreadcrumbItem>
                  <BreadcrumbLink className="hover:text-white" href="/">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-red-500/70" />
                <BreadcrumbItem>
                  <BreadcrumbLink className="hover:text-white" href="/shop">
                    Shop
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-red-500/70" />
                <BreadcrumbItem>
                  <BreadcrumbLink className="hover:text-white" href={categoryHref}>
                    {categoryLabel}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-red-500/70" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-14 xl:gap-[4.5rem]">
              <div className="animate-on-scroll animated">
                <div className="group relative mb-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 p-4 shadow-[0_18px_56px_rgba(0,0,0,0.38)] sm:p-5">
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/6 bg-[radial-gradient(circle_at_20%_0%,rgba(220,38,38,0.16),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.05),transparent_22%),linear-gradient(180deg,rgba(22,22,24,0.96),rgba(5,5,5,1))]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_46%)]" />
                    <div className="absolute inset-x-[18%] bottom-[10%] h-10 rounded-full bg-red-600/20 blur-[30px]" />
                    <Image
                      src={currentImage}
                      alt={currentImageLabel}
                      fill
                      priority={currentImageIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={70}
                      className="product-image gpu-accelerated h-full w-full object-contain p-6 drop-shadow-[0_22px_40px_rgba(0,0,0,0.42)] transition-transform duration-500 ease-out sm:p-8"
                    />

                    <button
                      type="button"
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-3 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-black/85 group-hover:opacity-100"
                      onClick={() => updateImage(currentImageIndex - 1)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-3 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-black/85 group-hover:opacity-100"
                      onClick={() => updateImage(currentImageIndex + 1)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/65 px-3 py-1 text-sm font-semibold tracking-[0.16em] text-white shadow-lg backdrop-blur-sm">
                      <span>{currentImageIndex + 1}</span> / <span>{product.images.length}</span>
                    </div>
                  </div>
                </div>

                <div className={`grid gap-3 ${product.images.length > 4 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4"}`}>
                  {product.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      aria-label={`Show ${product.name} image ${index + 1}`}
                      className={`product-thumbnail relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(22,22,22,0.95),rgba(7,7,7,1))] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-all duration-300 ${
                        index === currentImageIndex
                          ? "border-red-600 ring-1 ring-red-600/60 shadow-[0_14px_36px_rgba(220,38,38,0.18)]"
                          : "border-white/8 hover:border-red-600/70"
                      }`}
                      onClick={() => updateImage(index)}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_42%)]" />
                      <Image
                        src={image}
                        alt={
                          product.imageAlts?.[index] ??
                          `${product.name} image ${index + 1}`
                        }
                        width={160}
                        height={160}
                        sizes="(max-width: 640px) 33vw, 160px"
                        quality={70}
                        className="relative h-20 w-full rounded-xl object-contain bg-transparent p-1 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-on-scroll animated">
                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.3)] sm:p-8 lg:sticky lg:top-24">
                  <div className="mb-6 border-b border-white/10 pb-5 sm:mb-8 sm:pb-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
                      {product.kicker}
                    </p>
                    <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                      {product.name}
                    </h1>
                    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                      <p className="text-3xl font-black tracking-tight text-red-500 sm:text-[2rem]">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.originalPrice ? (
                        <p className="pb-1 text-lg font-medium text-white/35 line-through sm:text-xl">
                          {product.originalPrice}
                        </p>
                      ) : null}
                    </div>
                    {!isStraps ? (
                      <p className="mt-3 text-sm font-semibold text-gray-400">
                        Select a belt variant and size to confirm live inventory before checkout.
                      </p>
                    ) : null}
                  </div>

                  <div className="mb-6 sm:mb-8">
                    <p className="mb-5 max-w-xl text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
                      {product.intro}
                    </p>
                    <div className="mb-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                        {availabilityMessage}
                      </span>
                      {!isStraps && product.availableSizes.length > 0 ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                          Sizes {product.availableSizes.join(", ")}
                        </span>
                      ) : null}
                    </div>
                    <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
                      {product.featureList.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                          <span className="mt-0.5 text-red-600">✓</span>
                          <span className="leading-6">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {extraPanel ? (
                    <div className="mb-6 rounded-2xl border border-red-600/20 bg-black/45 p-5 shadow-[0_16px_42px_rgba(0,0,0,0.28)] sm:mb-8">
                      {extraPanel}
                    </div>
                  ) : null}

                  <div className="mb-8 rounded-2xl border border-white/8 bg-black/40 p-5">
                    <label htmlFor="quantity" className="mb-3 block text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-lg font-bold text-white transition-all hover:border-red-600/70 hover:bg-neutral-800"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        -
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                        className="h-11 w-24 rounded-xl border border-white/10 bg-neutral-950 text-center text-base font-semibold text-white outline-none transition-colors focus:border-red-600"
                      />
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-lg font-bold text-white transition-all hover:border-red-600/70 hover:bg-neutral-800"
                        onClick={() => setQuantity((current) => current + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addToCartDisabled}
                      className={`glow-red w-full rounded-full px-8 py-4 text-base font-bold transition-[transform,background-color,border-color,box-shadow] duration-300 sm:text-lg ${
                        addToCartDisabled
                          ? "cursor-not-allowed bg-red-950/70 text-white/55"
                          : "bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_16px_38px_rgba(220,38,38,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                      }`}
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={addToCartDisabled}
                      className={`w-full rounded-full border-2 px-8 py-4 text-base font-bold transition-[transform,background-color,border-color,box-shadow] duration-300 sm:text-lg ${
                        addToCartDisabled
                          ? "cursor-not-allowed border-red-950/70 bg-transparent text-red-950/80"
                          : "border-red-600 bg-transparent text-red-500 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-600/12 hover:text-white hover:shadow-[0_16px_38px_rgba(220,38,38,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-gray-300 sm:grid-cols-3">
                    {buyReassurance.map((message) => (
                      <div
                        key={message}
                        className="rounded-xl border border-white/8 bg-black/35 px-4 py-3 text-center font-semibold"
                      >
                        {message}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-gray-400">
                    <Link className="transition-colors hover:text-red-400" href="/shipping">
                      Shipping policy
                    </Link>
                    <Link className="transition-colors hover:text-red-400" href="/returns">
                      Returns policy
                    </Link>
                    <Link className="transition-colors hover:text-red-400" href="/contact">
                      Contact support
                    </Link>
                  </div>
                  <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                    Payment details are entered only on Stripe Checkout.
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll animated mt-16 sm:mt-20">
              {!isStraps ? (
                <section
                  aria-labelledby="sizing-guidance"
                  className="mb-12 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6 sm:p-8"
                >
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
                    <div>
                      <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                        Size Guide
                      </p>
                      <h2
                        id="sizing-guidance"
                        className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl"
                      >
                        How to choose your size.
                      </h2>
                      <p className="mt-4 text-sm leading-6 text-gray-400 sm:text-base">
                        Exact size ranges are not currently published on the product page. Use the measurement guidance below and contact support if you are unsure before ordering.
                      </p>
                      <Link
                        href="/contact"
                        className="mt-5 inline-flex rounded-full border border-red-600/50 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/12"
                      >
                        Ask sizing support
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {sizeGuidance.map(([title, text]) => (
                        <div
                          key={title}
                          className="rounded-2xl border border-white/8 bg-black/35 p-5 text-sm leading-6 text-gray-300"
                        >
                          <h3 className="mb-2 text-base font-black text-white">
                            {title}
                          </h3>
                          <p>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {product.availableSizes.length > 0 ? (
                    <div className="mt-8 overflow-hidden rounded-2xl border border-white/8">
                      <div className="grid grid-cols-[0.8fr_1.2fr] bg-black/50 text-sm font-bold uppercase tracking-[0.16em] text-white">
                        <div className="border-r border-white/8 px-4 py-3">Size</div>
                        <div className="px-4 py-3">Current guidance</div>
                      </div>
                      {product.availableSizes.map((size) => (
                        <div
                          key={size}
                          className="grid grid-cols-[0.8fr_1.2fr] border-t border-white/8 text-sm text-gray-300"
                        >
                          <div className="border-r border-white/8 px-4 py-3 font-bold text-white">
                            {size}
                          </div>
                          <div className="px-4 py-3">
                            Available in the live catalog. Measure where the belt sits before choosing.
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {!isStraps ? (
                <section
                  aria-labelledby="belt-quick-specs"
                  className="mb-12 rounded-[1.5rem] border border-red-600/15 bg-[linear-gradient(180deg,rgba(127,29,29,0.16),rgba(8,8,8,0.92))] p-6 sm:p-8"
                >
                  <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                    Specs
                  </p>
                  <h2
                    id="belt-quick-specs"
                    className="mb-6 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl"
                  >
                    Belt details at a glance.
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {beltQuickSpecs.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/8 bg-black/40 p-5"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                          {label}
                        </p>
                        <p className="mt-2 text-base font-black text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-3">
                {productBenefits.map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-[1.5rem] border border-white/8 bg-gradient-to-b from-neutral-900 to-black p-6"
                  >
                    <h3 className="text-xl font-black tracking-[-0.03em] text-white">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {description}
                    </p>
                  </div>
                ))}
              </section>

              {showStandaloneDescriptionGallery ? (
                <section
                  aria-labelledby="product-description-images"
                  className="mb-16 space-y-6 sm:mb-20"
                >
                  <div className="max-w-3xl">
                    <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                      Description
                    </p>
                    <h2
                      id="product-description-images"
                      className="text-3xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl"
                    >
                      Wrist Straps Details
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {product.descriptionGalleryImages?.map((image, index) => (
                    <Image
                      key={`standalone-${image}`}
                      src={image}
                      alt={`${product.name} detail image ${index + 1}`}
                      width={1600}
                      height={1600}
                      priority={index === 0}
                      sizes="(max-width: 1280px) 100vw, 1200px"
                      quality={70}
                      className="h-auto w-full object-contain"
                    />
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="mb-8 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
                <div className="flex flex-wrap gap-2">
                  {detailTabs.map(([tabName, label]) => (
                    <button
                      key={tabName}
                      type="button"
                      className={`tab-btn rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all sm:px-6 ${
                        activeTab === tabName
                          ? "bg-red-600 text-white shadow-[0_12px_30px_rgba(220,38,38,0.24)]"
                          : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                      onClick={() => setActiveTab(tabName)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "description" && product.slug !== "zeus" ? (
                <div className="space-y-5">
                  {product.descriptionGalleryImages?.map((image, index) => (
                    <Image
                      key={image}
                      src={image}
                      alt={`${product.name} description image ${index + 1}`}
                      width={1600}
                      height={1600}
                      sizes="(max-width: 1280px) 100vw, 1200px"
                      quality={70}
                      className="h-auto w-full"
                    />
                  ))}
                </div>
              ) : null}

              {activeTab === "specs" ? (
                <div>
                  <h3 className="mb-8 text-2xl font-bold tracking-[0.12em] text-white">SPECIFICATIONS</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/8 bg-gradient-to-b from-neutral-900 to-black p-6 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
                      <h4 className="mb-5 border-b border-white/10 pb-3 text-lg font-bold tracking-[0.06em] text-white">
                        Included
                      </h4>
                      <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
                        {includedItems.map((item) => (
                          <li key={item} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                            <span className="text-red-600">•</span>
                            <span className="text-white">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {product.specificationGroups.map((group) => (
                      <div key={group.title} className="rounded-[1.5rem] border border-white/8 bg-gradient-to-b from-neutral-900 to-black p-6 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
                        <h4 className="mb-5 border-b border-white/10 pb-3 text-lg font-bold tracking-[0.06em] text-white">
                          {group.title}
                        </h4>
                        {group.rows ? (
                          <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
                            {group.rows.map(([label, value]) => (
                              <li key={label} className="flex justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-3">
                                <span className="text-gray-400">{label}</span>
                                <span className={`text-right font-semibold text-white ${group.mono ? "font-mono text-sm" : ""}`}>
                                  {value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
                            {group.bullets?.map((bullet) => (
                              <li key={bullet} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                                <span className="text-red-600">•</span>
                                <span className="text-white">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === "reviews" ? (
                <ProductReviewsPanel reviews={product.reviews} />
              ) : null}

              <section className="mt-12 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
                <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                  FAQ
                </p>
                <h2 className="mb-6 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                  Product questions
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {faqItems.map(([question, answer]) => (
                    <div
                      key={question}
                      className="rounded-2xl border border-white/8 bg-black/35 p-5"
                    >
                      <h3 className="text-base font-black text-white">
                        {question}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
        {bottomSection}
      </main>
      <Footer />

      {notification ? (
        <div className="fixed top-24 right-4 z-50 rounded-lg bg-red-600 px-6 py-3 text-white shadow-lg transition-transform duration-300">
          {notification}
        </div>
      ) : null}

      {product.catalogCategory === "belts" || product.catalogCategory === "straps" ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 py-3 shadow-[0_-18px_42px_rgba(0,0,0,0.45)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {product.name}
              </p>
              <p className="text-sm font-bold text-red-400">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addToCartDisabled}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition-colors ${
                addToCartDisabled
                  ? "bg-red-950/70 text-white/55"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {addToCartDisabled ? (isStraps ? "Out of Stock" : "Select Size") : "Add to Cart"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
