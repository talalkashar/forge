import Footer from "../../components/home/Footer";
import Navbar from "../../components/home/Navbar";
import ProductDetailLoading from "../../components/product/ProductDetailLoading";

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main>
        <section className="bg-black px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <ProductDetailLoading />
        </section>
      </main>
      <Footer />
    </>
  );
}
