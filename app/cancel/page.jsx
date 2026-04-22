import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-white">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] p-10 text-center shadow-[0_18px_56px_rgba(0,0,0,0.3)]">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
          Checkout Cancelled
        </p>
        <h1 className="text-4xl font-black tracking-[-0.05em]">Payment Cancelled</h1>
        <p className="mt-5 text-base leading-7 text-gray-400">
          No charge was made. Your cart is still available if you want to try again.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/cart"
            className="rounded-full border border-red-600/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/10"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
