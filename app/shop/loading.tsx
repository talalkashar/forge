import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";
import ProductGridLoading from "../components/product/ProductGridLoading";

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="h-3 w-24 animate-pulse bg-red-600/30" />
            <div className="mt-5 h-12 w-64 animate-pulse bg-white/[0.08] sm:w-80" />
            <div className="mt-4 h-5 w-full max-w-md animate-pulse bg-white/[0.05]" />
          </div>
        </section>
        <section className="px-6 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/35">
              Loading FORGE GYM…
            </p>
            <ProductGridLoading />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
