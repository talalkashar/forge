function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] shadow-[0_18px_52px_rgba(0,0,0,0.32)]">
      <div className="aspect-[4/5] animate-pulse border-b border-white/8 bg-white/[0.04]" />
      <div className="space-y-4 p-6">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="h-8 w-2/3 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="h-16 w-full animate-pulse rounded-2xl bg-white/[0.05]" />
        <div className="h-6 w-28 animate-pulse rounded-full bg-white/[0.08]" />
      </div>
    </div>
  );
}

export default function ProductGridLoading() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}
