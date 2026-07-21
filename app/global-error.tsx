"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black px-6 py-24 text-white sm:px-8">
        <main className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
            FORGE
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Something went wrong
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            Refresh the page or return to the shop.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-full border border-red-600/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/10"
              onClick={() => reset()}
            >
              Try Again
            </button>
            <a
              href="/shop"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-red-600/60"
            >
              Shop FORGE
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
