export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-14 xl:gap-[4.5rem]">
        <div className="space-y-5">
          <div className="aspect-square animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.04]" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`thumb-${index}`}
                className="h-24 animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.3)] sm:p-8">
          <div className="h-3 w-28 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="mt-4 h-12 w-3/4 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="mt-4 h-10 w-40 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="mt-8 space-y-3">
            <div className="h-6 w-full animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-6 w-5/6 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}
