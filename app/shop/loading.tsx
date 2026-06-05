import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";
import ProductGridLoading from "../components/product/ProductGridLoading";

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-red-600/10 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_38%),linear-gradient(180deg,#090909_0%,#000000_100%)] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="h-4 w-20 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="mt-5 h-12 w-72 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="mt-5 h-8 w-full max-w-2xl animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        </section>
        <section className="px-6 py-14 sm:px-8 sm:py-18">
          <ProductGridLoading />
        </section>
      </main>
      <Footer />
    </>
  );
}
