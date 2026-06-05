export default function ProductCollectionState({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] p-8 text-white shadow-[0_18px_52px_rgba(0,0,0,0.32)]">
      <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
        {message}
      </p>
    </div>
  );
}
