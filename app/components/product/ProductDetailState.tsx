import Link from "next/link";
import Footer from "../home/Footer";
import Navbar from "../home/Navbar";

export default function ProductDetailState({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-3xl border border-white/[0.08] bg-[#080808] p-8 sm:p-10">
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-red-500">
              FORGE GYM · {eyebrow}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/50 sm:text-base sm:leading-7">
              {message}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-500"
              >
                Back to shop
              </Link>
              <Link
                href="/"
                className="inline-flex rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-white/35"
              >
                Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
