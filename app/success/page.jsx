"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-white">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] p-10 text-center shadow-[0_18px_56px_rgba(0,0,0,0.3)]">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
          Payment Complete
        </p>
        <h1 className="text-4xl font-black tracking-[-0.05em]">Payment Successful</h1>
        <p className="mt-5 text-base leading-7 text-gray-400">
          Your Stripe checkout completed successfully. The cart has been cleared.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/shop"
            className="rounded-full border border-red-600/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/10"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
