import Link from "next/link";

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
    <div className="border border-white/[0.08] bg-[#080808] px-6 py-14 text-center sm:px-10">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-red-500">
        FORGE GYM · {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/50">
        {message}
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-flex rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-500"
      >
        Back to shop
      </Link>
    </div>
  );
}
