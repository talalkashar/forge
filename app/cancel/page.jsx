"use client";

import Link from "next/link";
import ForgeLogo from "../components/home/ForgeLogo";

export default function CancelPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div
        className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-red-800/15 blur-[110px]"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl border border-white/[0.1] bg-black/80 p-8 text-center sm:p-12">
        <div className="mb-8 flex justify-center">
          <ForgeLogo variant="mark" markClassName="h-12 sm:h-14" />
        </div>
        <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
          FORGE GYM™
        </p>
        <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
          Checkout paused
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/50">
          No charge went through. Your cart is still there — finish when you are
          ready.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/cart"
            className="rounded-full bg-red-600 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
          >
            Back to cart
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-white/15 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
