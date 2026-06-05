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
      <main>
        <section className="bg-black px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-8 shadow-[0_18px_56px_rgba(0,0,0,0.3)] sm:p-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
                {eyebrow}
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-300 sm:text-lg">
                {message}
              </p>
              <div className="mt-8">
                <Link
                  href="/shop"
                  className="inline-flex rounded-full border border-red-600 bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:scale-[1.01] hover:bg-red-700"
                >
                  Back To Shop
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
