import Footer from "../home/Footer";
import Navbar from "../home/Navbar";
import ProductCard from "./ProductCard";
import { products } from "./productData";

export default function ShopCatalogPage() {
  return (
    <>
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1} className="bg-black">
        <section className="border-b border-red-600/10 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_38%),linear-gradient(180deg,#090909_0%,#000000_100%)] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
              Shop
            </p>
            <h1 className="max-w-4xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl md:text-6xl">
              All FORGE Products
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Browse the current FORGE lineup. Every product card links directly to a
              dedicated detail page so sizing, specs, and checkout stay clear and
              consistent.
            </p>
          </div>
        </section>

        <section className="px-6 py-14 sm:px-8 sm:py-18">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
