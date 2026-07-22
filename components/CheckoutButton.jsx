"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CheckoutButton() {
  const { cart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0 || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Checkout failed");
      }

      window.location.href = data.url;
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Checkout failed");
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={cart.length === 0 || isLoading}
      className="group relative w-full overflow-hidden rounded-full bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:hover:translate-y-0"
    >
      <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0 group-disabled:hidden" />
      <span className="relative">
        {isLoading ? "Redirecting to Stripe…" : "Checkout · FORGE GYM"}
      </span>
    </button>
  );
}
