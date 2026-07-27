"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import ForgeLogo from "../components/home/ForgeLogo";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const [emailStatus, setEmailStatus] = useState("pending");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Fallback confirmation email if Stripe webhook missed payment_intent.succeeded.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const clientSecret = params.get("payment_intent_client_secret");
    if (!paymentIntentId || !clientSecret) {
      setEmailStatus("unknown");
      return;
    }

    let email = "";
    try {
      email = sessionStorage.getItem("forge_order_email") || "";
    } catch {
      // ignore
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/checkout/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId,
            clientSecret,
            email: email || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.ok) {
          setEmailStatus("sent");
          try {
            sessionStorage.removeItem("forge_order_email");
          } catch {
            // ignore
          }
        } else {
          setEmailStatus("failed");
          console.warn("[success] confirmation email:", data);
        }
      } catch (error) {
        if (!cancelled) {
          setEmailStatus("failed");
          console.warn("[success] confirmation email error:", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-red-700/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-950/40 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl border border-white/[0.1] bg-black/80 p-8 text-center sm:p-12">
        <div className="mb-8 flex justify-center">
          <ForgeLogo markClassName="text-[1.75rem] sm:text-[2rem]" />
        </div>
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-emerald-500/40 bg-emerald-500/10 text-2xl text-emerald-300">
          ✓
        </div>
        <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
          Order locked in
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/50 sm:text-base">
          Payment cleared through Stripe. Your cart is empty. Gear is on the
          way.
          {emailStatus === "sent"
            ? " Confirmation email is on the way."
            : emailStatus === "failed"
              ? " If you do not see a confirmation email soon, check spam or contact contact@forgegym.us."
              : " Check your email for confirmation when it lands."}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/30">
          Train hard. Recover. Repeat.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="rounded-full bg-red-600 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
          >
            Keep shopping
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
