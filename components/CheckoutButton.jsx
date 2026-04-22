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
      className="w-full rounded-full bg-red-600 px-6 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-900/60 disabled:text-white/60"
    >
      {isLoading ? "Redirecting..." : "Checkout"}
    </button>
  );
}
