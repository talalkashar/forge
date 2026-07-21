function LoadingCard() {
  return (
    <div className="overflow-hidden border border-white/[0.08] bg-[#080808]">
      <div className="aspect-[4/5] animate-pulse border-b border-white/[0.06] bg-[radial-gradient(circle_at_50%_30%,rgba(120,20,20,0.15),transparent_50%),#101010]" />
      <div className="space-y-3 p-5">
        <div className="h-2.5 w-20 animate-pulse bg-white/10" />
        <div className="h-6 w-2/3 animate-pulse bg-white/10" />
        <div className="h-10 w-full animate-pulse bg-white/[0.06]" />
        <div className="h-5 w-16 animate-pulse bg-white/10" />
      </div>
    </div>
  );
}

export default function ProductGridLoading() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}
