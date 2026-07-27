"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type ServerLineItem = {
  name: string;
  price: number;
  quantity: number;
};

function formatUsdFromCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function ForgePaymentForm({ amountCents }: { amountCents: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    // Only reached when payment fails or requires additional action without redirect.
    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage ? (
        <p
          role="alert"
          className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="group relative w-full overflow-hidden rounded-full bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:hover:translate-y-0"
      >
        <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0 group-disabled:hidden" />
        <span className="relative">
          {isSubmitting
            ? "Processing…"
            : `Pay ${formatUsdFromCents(amountCents)} · FORGE GYM`}
        </span>
      </button>

      <p className="text-center text-[0.65rem] uppercase tracking-[0.12em] text-white/30">
        Encrypted payment · Powered by Stripe · Stays on FORGE
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, cartSubtotal, isHydrated } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [lineItems, setLineItems] = useState<ServerLineItem[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  const cartSignature = useMemo(
    () =>
      cart
        .map(
          (item) =>
            `${item.cartKey ?? item.slug}:${item.variantId ?? ""}:${item.size ?? ""}:${item.quantity}`,
        )
        .join("|"),
    [cart],
  );

  async function createPaymentIntent() {
    const items = cartRef.current;
    if (items.length === 0) {
      return;
    }

    setIsCreating(true);
    setInitError(null);
    setClientSecret(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = (await response.json()) as {
        error?: string;
        clientSecret?: string;
        amount?: number;
        lineItems?: ServerLineItem[];
      };

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error ?? "Unable to start checkout.");
      }

      setClientSecret(data.clientSecret);
      setAmountCents(typeof data.amount === "number" ? data.amount : 0);
      setLineItems(Array.isArray(data.lineItems) ? data.lineItems : []);
    } catch (error) {
      setInitError(
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!isHydrated || cart.length === 0) {
      return;
    }
    void createPaymentIntent();
    // Recreate PaymentIntent only when cart contents change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartSignature is the intentional key
  }, [isHydrated, cartSignature]);

  const elementsOptions = useMemo((): StripeElementsOptions | null => {
    if (!clientSecret) {
      return null;
    }

    return {
      clientSecret,
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#dc2626",
          colorBackground: "#080808",
          colorText: "#f5f5f5",
          colorTextSecondary: "rgba(255,255,255,0.55)",
          colorDanger: "#f87171",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          borderRadius: "0px",
          spacingUnit: "4px",
        },
        rules: {
          ".Input": {
            backgroundColor: "#0c0c0c",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "none",
            color: "#ffffff",
          },
          ".Input:focus": {
            border: "1px solid rgba(220,38,38,0.7)",
            boxShadow: "0 0 0 1px rgba(220,38,38,0.35)",
          },
          ".Label": {
            color: "rgba(255,255,255,0.55)",
            fontWeight: "600",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "11px",
          },
          ".Tab": {
            backgroundColor: "#0c0c0c",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)",
          },
          ".Tab--selected": {
            backgroundColor: "#141414",
            border: "1px solid rgba(220,38,38,0.55)",
            color: "#ffffff",
          },
          ".TabIcon--selected": {
            fill: "#dc2626",
          },
          ".Block": {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        },
      },
    };
  }, [clientSecret]);

  const displaySubtotal =
    amountCents > 0 ? amountCents / 100 : isHydrated ? cartSubtotal : 0;

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="min-h-screen bg-black px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-red-500">
                Secure checkout
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">
                Checkout
              </h1>
            </div>
            <Link
              href="/cart"
              className="text-xs font-bold uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white"
            >
              ← Back to cart
            </Link>
          </div>

          {!publishableKey || !stripePromise ? (
            <div className="border border-red-500/30 bg-red-500/10 px-6 py-8 text-sm text-red-100">
              Stripe publishable key is missing. Add{" "}
              <code className="text-white">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
              to <code className="text-white">.env.local</code>.
            </div>
          ) : !isHydrated ? (
            <div className="border border-white/10 bg-white/[0.03] p-8 text-white/45">
              Loading checkout…
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
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              <section className="border border-white/[0.08] bg-[#080808] p-5 sm:p-7">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                  Payment
                </h2>
                <p className="mt-2 text-sm text-white/40">
                  Card details stay on FORGE — encrypted by Stripe. No redirect
                  to a separate checkout page.
                </p>

                <div className="mt-8">
                  {isCreating ? (
                    <div className="border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/45">
                      Preparing secure payment…
                    </div>
                  ) : initError ? (
                    <div className="space-y-4">
                      <p
                        role="alert"
                        className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                      >
                        {initError}
                      </p>
                      <button
                        type="button"
                        onClick={() => void createPaymentIntent()}
                        className="rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-white/35"
                      >
                        Try again
                      </button>
                    </div>
                  ) : clientSecret && elementsOptions ? (
                    <Elements stripe={stripePromise} options={elementsOptions}>
                      <ForgePaymentForm amountCents={amountCents} />
                    </Elements>
                  ) : (
                    <div className="border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/45">
                      Waiting for payment form…
                    </div>
                  )}
                </div>
              </section>

              <aside className="h-fit border border-white/[0.08] bg-[#080808] p-6 lg:sticky lg:top-24">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                  Order summary
                </h2>

                <ul className="mt-6 space-y-4">
                  {cart.map((item) => {
                    const key = item.cartKey ?? item.slug;
                    return (
                      <li key={key} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-white/[0.06] bg-[radial-gradient(circle_at_50%_30%,rgba(120,20,20,0.2),transparent_55%),#0c0c0c]">
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              sizes="64px"
                              quality={75}
                              className="object-contain p-1.5"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">
                            {item.name}
                          </p>
                          {item.size ? (
                            <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-white/35">
                              Size {item.size} · Qty {item.quantity}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-white/35">
                              Qty {item.quantity}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-white/80">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {lineItems.length > 0 ? (
                  <p className="mt-4 text-[0.65rem] uppercase tracking-[0.12em] text-white/25">
                    Prices verified against live catalog
                  </p>
                ) : null}

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
                  <span className="text-sm text-white/45">Total</span>
                  <span className="text-xl font-black text-white">
                    ${displaySubtotal.toFixed(2)}
                  </span>
                </div>

                <ul className="mt-5 space-y-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/40">
                  <li>· On-site Stripe payment</li>
                  <li>· Live inventory check</li>
                  <li>· Returns per policy</li>
                </ul>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
