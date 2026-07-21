import Link from "next/link";
import Footer from "./components/home/Footer";
import Navbar from "./components/home/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-black px-6 text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
          FORGE GYM™
        </p>
        <h1 className="mt-4 text-5xl font-black text-white sm:text-7xl">404</h1>
        <p className="mt-4 max-w-md text-sm text-white/50">
          That page does not exist. Head back to the shop and keep training.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-red-600 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-red-500"
          >
            Shop gear
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white hover:border-white/35"
          >
            Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
