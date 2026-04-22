"use client";

import dynamic from "next/dynamic";
import { ReactNode, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Footer from "../home/Footer";
import Navbar from "../home/Navbar";
import type { ProductDetailConfig } from "./productData";

type TabName = "description" | "specs" | "reviews";

const ProductReviewsPanel = dynamic(() => import("./ProductReviewsPanel"));

export default function ProductDetailPage({
  product,
  extraPanel,
  bottomSection,
  validateAddToCart,
  addToCartDisabled = false,
  resolveCartItem,
}: {
  product: ProductDetailConfig;
  extraPanel?: ReactNode;
  bottomSection?: ReactNode;
  validateAddToCart?: () => string | null;
  addToCartDisabled?: boolean;
  resolveCartItem?: () => {
    slug: string;
    name: string;
    cartKey?: string;
    href?: string;
    images?: string[];
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

  const updateImage = (nextIndex: number) => {
    if (nextIndex < 0) {
      setCurrentImageIndex(product.images.length - 1);
      return;
    }

    if (nextIndex >= product.images.length) {
      setCurrentImageIndex(0);
      return;
    }

    setCurrentImageIndex(nextIndex);
  };

  const addSelectedItemToCart = () => {
    try {
      const validationError = validateAddToCart?.();

      if (validationError) {
        window.alert(validationError);
        setNotification(validationError);
        window.setTimeout(() => setNotification(""), 3000);
        return false;
      }

      const cartItem = resolveCartItem?.() ?? {
        slug: product.slug,
        name: product.cartName,
      };
      addToCart({
        slug: cartItem.slug,
        cartKey: cartItem.cartKey,
        name: cartItem.name,
        price: product.price,
        quantity,
        images: cartItem.images ?? product.images,
        href: cartItem.href ?? product.href,
      });
      setNotification(`${cartItem.name} added to cart!`);
      window.setTimeout(() => setNotification(""), 3000);
      return true;
    } catch {
      setNotification("Error: Cart system not available");
      window.setTimeout(() => setNotification(""), 3000);
      return false;
    }
  };

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
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1}>
        <section className="bg-black px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-14 xl:gap-[4.5rem]">
              <div className="animate-on-scroll animated">
                <div className="group relative mb-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 p-4 shadow-[0_18px_56px_rgba(0,0,0,0.38)] sm:p-5">
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/6 bg-[radial-gradient(circle_at_20%_0%,rgba(220,38,38,0.16),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.05),transparent_22%),linear-gradient(180deg,rgba(22,22,24,0.96),rgba(5,5,5,1))]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_46%)]" />
                    <div className="absolute inset-x-[18%] bottom-[10%] h-10 rounded-full bg-red-600/20 blur-[30px]" />
                    <Image
                      key={currentImage}
                      src={currentImage}
                      alt={currentImageLabel}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={70}
                      loading={currentImageIndex === 0 ? "eager" : "lazy"}
                      fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                      className="product-image gpu-accelerated h-full w-full object-contain p-6 drop-shadow-[0_22px_40px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out sm:p-8"
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
                        quality={70}
                        className="relative h-20 w-full rounded-xl object-contain bg-transparent p-1 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-on-scroll animated">
                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.3)] sm:p-8">
                  <div className="mb-8 border-b border-white/10 pb-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
                      {product.kicker}
                    </p>
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                      {product.name}
                    </h1>
                    <div className="flex items-end gap-4">
                      <p className="text-3xl font-bold tracking-tight text-red-600 sm:text-[2rem]">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.originalPrice ? (
                        <p className="pb-1 text-lg font-medium text-white/35 line-through sm:text-xl">
                          {product.originalPrice}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="mb-5 max-w-xl text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
                      {product.intro}
                    </p>
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
                    <div className="mb-8 rounded-2xl border border-white/8 bg-black/30 p-5">
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
                      className={`glow-red w-full rounded-full px-8 py-4 text-base font-bold transition-all duration-300 sm:text-lg ${
                        addToCartDisabled
                          ? "cursor-not-allowed bg-red-950/70 text-white/55"
                          : "bg-red-600 text-white hover:scale-[1.01] hover:bg-red-700"
                      }`}
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={addToCartDisabled}
                      className={`w-full rounded-full border-2 px-8 py-4 text-base font-bold transition-all duration-300 sm:text-lg ${
                        addToCartDisabled
                          ? "cursor-not-allowed border-red-950/70 bg-transparent text-red-950/80"
                          : "border-red-600 bg-transparent text-red-600 hover:scale-[1.01] hover:bg-red-600 hover:text-white"
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll animated mt-16 sm:mt-20">
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
                        sizes="(max-width: 1280px) 100vw, 1200px"
                        quality={70}
                        loading="lazy"
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
                      width={0}
                      height={0}
                      sizes="(max-width: 1280px) 100vw, 1200px"
                      quality={70}
                      className="w-full h-auto"
                    />
                  ))}
                </div>
              ) : null}

              {activeTab === "specs" ? (
                <div>
                  <h3 className="mb-8 text-2xl font-bold tracking-[0.12em] text-white">SPECIFICATIONS</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
    </>
  );
}
