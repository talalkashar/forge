"use client";

import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { useCart } from "@/context/CartContext";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export default function CartPage() {
  const { cart, cartSubtotal, removeFromCart, updateQuantity, isHydrated } = useCart();
  const hasBelt = cart.some((item) =>
    ["zeus", "berserk", "black"].includes(item.slug),
  );
  const hasStraps = cart.some((item) => item.slug === "straps");

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="min-h-screen bg-black px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">
              Cart
            </h1>
          </div>

          {!isHydrated ? (
            <div className="border border-white/10 bg-white/[0.03] p-8 text-white/45">
              Loading cart…
            </div>
          ) : cart.length === 0 ? (
            <div className="border border-white/[0.08] bg-[#080808] px-6 py-16 text-center sm:px-10">
              <p className="text-lg text-white/60">Your cart is empty.</p>
              <Link
                href="/shop"
                className="mt-8 inline-flex rounded-full bg-red-600 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
              >
                Shop gear
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-3">
                {cart.map((item) => {
                  const itemKey = item.cartKey ?? item.slug;

                  return (
                    <div
                      key={itemKey}
                      className="flex flex-col gap-4 border border-white/[0.08] bg-[#080808] p-4 sm:flex-row sm:items-center sm:p-5"
                    >
                      <div className="relative h-28 w-full overflow-hidden border border-white/[0.06] bg-[radial-gradient(circle_at_50%_30%,rgba(120,20,20,0.2),transparent_55%),#0c0c0c] sm:h-24 sm:w-24">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.name}
                            fill
                            sizes="112px"
                            quality={80}
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[0.6rem] font-black uppercase tracking-[0.16em] text-red-500/70">
                            FORGE
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-black text-white">
                          {item.name}
                        </h2>
                        {item.size ? (
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/40">
                            Size {item.size}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm font-bold text-white/80">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-white/12">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-white/5"
                            onClick={() =>
                              updateQuantity(
                                itemKey,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-white/5"
                            onClick={() =>
                              updateQuantity(itemKey, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-bold uppercase tracking-[0.12em] text-white/35 transition-colors hover:text-red-400"
                          onClick={() => removeFromCart(itemKey)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {hasBelt && !hasStraps ? (
                  <Link
                    href="/product/straps"
                    className="group flex items-center justify-between border border-dashed border-white/15 px-5 py-4 transition-colors hover:border-white/30"
                  >
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-red-400">
                        Optional
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Add wrist straps
                      </p>
                    </div>
                    <span className="text-white/40 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                ) : null}
              </div>

              <aside className="h-fit border border-white/[0.08] bg-[#080808] p-6 lg:sticky lg:top-24">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                  Summary
                </h2>
                <div className="mt-6 flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <span className="text-sm text-white/45">Subtotal</span>
                  <span className="text-xl font-black text-white">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/35">
                  Shipping and taxes calculated at Stripe checkout.
                </p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.12em] text-white/30">
                  Questions before you pay? See FAQ or contact.
                </p>
                <ul className="mt-4 space-y-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/40">
                  <li>· Encrypted Stripe payment</li>
                  <li>· Order email when available</li>
                  <li>· Returns per policy</li>
                </ul>
                <div className="mt-6">
                  <CheckoutButton />
                </div>
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-xs font-bold uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white"
                >
                  Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
