export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
        Loading product…
      </p>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-14 xl:gap-[4.5rem]">
        <div className="space-y-5">
          <div className="aspect-square animate-pulse border border-white/12 bg-white/[0.06]" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`thumb-${index}`}
                className="aspect-square animate-pulse border border-white/10 bg-white/[0.05]"
              />
            ))}
          </div>
        </div>
        <div className="border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
          <div className="h-3 w-28 animate-pulse rounded-full bg-white/15" />
          <div className="mt-4 h-10 w-3/4 animate-pulse rounded-full bg-white/15" />
          <div className="mt-4 h-8 w-32 animate-pulse rounded-full bg-red-600/30" />
          <div className="mt-8 space-y-3">
            <div className="h-5 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-5 w-5/6 animate-pulse rounded-full bg-white/10" />
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="mt-10 h-12 w-full animate-pulse rounded-full bg-red-600/40" />
        </div>
      </div>
    </div>
  );
}
