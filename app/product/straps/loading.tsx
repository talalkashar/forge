import Footer from "../../components/home/Footer";
import Navbar from "../../components/home/Navbar";
import ProductDetailLoading from "../../components/product/ProductDetailLoading";

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <p className="mx-auto mb-6 max-w-7xl text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/35">
            Loading FORGE GYM straps…
          </p>
          <ProductDetailLoading />
        </section>
      </main>
      <Footer />
    </>
  );
}
