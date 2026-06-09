import Link from "next/link";
import Footer from "@/app/components/home/Footer";
import Navbar from "@/app/components/home/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-red-500/90">
            FORGE
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Page not found
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-400">
            The page you are looking for is not available.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full border border-red-600/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600/10"
          >
            Shop FORGE
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
