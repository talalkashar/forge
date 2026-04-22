"use client";

import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { useCart } from "@/context/CartContext";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export default function CartPage() {
  const { cart, cartSubtotal, removeFromCart, updateQuantity, isHydrated } = useCart();

  return (
    <>
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1} className="min-h-screen bg-black px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
              Cart
            </p>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
              Your Cart
            </h1>
          </div>

          {!isHydrated ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-gray-400">
              Loading cart...
            </div>
          ) : cart.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-lg text-gray-300">Your cart is empty.</p>
              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-full border border-red-600/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/10"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                {cart.map((item) => {
                  const itemKey = item.cartKey ?? item.slug;

                  return (
                    <div
                      key={itemKey}
                      className="flex flex-col gap-5 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.3)] sm:flex-row sm:items-center"
                    >
                      <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_42%),linear-gradient(180deg,rgba(18,18,18,0.95),rgba(8,8,8,1))] sm:w-28">
                        <Image
                          src={item.images?.[0] || "/fallback.png"}
                          alt={item.name}
                          fill
                          sizes="112px"
                          quality={70}
                          className="object-contain p-3"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-500/90">
                          FORGE
                        </p>
                        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                          {item.name}
                        </h2>
                        <p className="mt-2 text-base font-semibold text-red-500">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-lg font-bold text-white transition-all hover:border-red-600/70 hover:bg-neutral-800"
                          onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-base font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-lg font-bold text-white transition-all hover:border-red-600/70 hover:bg-neutral-800"
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-lg font-bold text-white">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-400 transition-colors hover:text-red-500"
                          onClick={() => removeFromCart(itemKey)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <aside className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.3)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-500/90">
                  Summary
                </p>
                <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-5">
                  <span className="text-base text-gray-400">Subtotal</span>
                  <span className="text-2xl font-black text-white">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-6 text-gray-400">
                  Secure checkout is handled by Stripe. Taxes and shipping are calculated during checkout.
                </p>
                <div className="mt-6">
                  <CheckoutButton />
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
