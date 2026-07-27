"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutButton() {
  const router = useRouter();
  const { cart } = useCart();

  return (
    <button
      type="button"
      onClick={() => router.push("/checkout")}
      disabled={cart.length === 0}
      className="group relative w-full overflow-hidden rounded-full bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:hover:translate-y-0"
    >
      <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0 group-disabled:hidden" />
      <span className="relative">Checkout · FORGE GYM</span>
    </button>
  );
}
