import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { productPresentationBySlug } from "../product/productData";
import Footer from "./Footer";
import HeroSlot from "./HeroSlot";
import Navbar from "./Navbar";

const InActionSection = dynamic(
  () => import("./InActionSection").then((mod) => mod.default),
  {
    loading: () => (
      <section className="min-h-[320px] bg-black" aria-hidden="true" />
    ),
  },
);

const trustPoints = [
  { label: "10mm core", detail: "Rigid bracing under load" },
  { label: "Lever lock", detail: "Fast, repeatable setup" },
  { label: "Stripe checkout", detail: "Secure card payments" },
  { label: "Ships US", detail: "Tracked fulfillment" },
];

// Heroes always come from productPresentationBySlug.images[0] (same as shop + PDP).
const products = [
  {
    title: "Berserk Lever Belt",
    detail: "10mm · Lever · $79.97",
    href: productPresentationBySlug.berserk.href,
    image: productPresentationBySlug.berserk.images[0],
  },
  {
    title: "Zeus Lever Belt",
    detail: "10mm · Lever · $79.97",
    href: productPresentationBySlug.zeus.href,
    image: productPresentationBySlug.zeus.images[0],
  },
  {
    title: "Black Lever Belt",
    detail: "10mm · Lever · $79.97",
    href: productPresentationBySlug.black.href,
    image: productPresentationBySlug.black.images[0],
  },
  {
    title: "Wrist Straps",
    detail: "Padded · Pair · $9.99",
    href: productPresentationBySlug.straps.href,
    image: productPresentationBySlug.straps.images[0],
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSlot />

        {/* Trust bar — brand seam between cinematic hero and shop */}
        <section className="relative border-b border-white/[0.06] bg-[#050505]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/55 to-transparent"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/[0.07] sm:grid-cols-4">
            {trustPoints.map((item) => (
              <div
                key={item.label}
                className="relative bg-black px-5 py-7 sm:px-7 sm:py-8"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-red-600/0 via-red-500/35 to-red-600/0 opacity-80"
                  aria-hidden="true"
                />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-red-400">
                  {item.label}
                </p>
                <p className="mt-2.5 text-sm leading-snug text-white/60 sm:text-[0.95rem]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="shop-collections"
          className="relative overflow-hidden border-t border-white/[0.06] bg-black px-6 py-24 sm:px-8 sm:py-28"
        >
          {/* Soft red stage so black isn’t dead after the hero */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(140,18,18,0.14),transparent_55%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between gap-6 sm:mb-14">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-10 bg-red-500" aria-hidden="true" />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-red-500">
                    Shop
                  </p>
                </div>
                <h2 className="text-4xl font-black leading-[0.9] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                  Gear
                </h2>
              </div>
              <Link
                href="/shop"
                className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
              {products.map((product) => (
                <Link
                  key={product.title}
                  href={product.href}
                  className="group relative flex h-full flex-col overflow-hidden border border-white/[0.1] bg-[#080808] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-red-500/45 hover:shadow-[0_0_0_1px_rgba(220,38,38,0.18),0_18px_50px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent transition-opacity duration-200 group-hover:via-red-500/70"
                    aria-hidden="true"
                  />
                  <div className="relative aspect-square overflow-hidden bg-black">
                    <div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(110,14,14,0.28),transparent_58%)] transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      quality={90}
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.05] sm:p-2.5"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3 border-t border-white/[0.06] p-5 sm:p-5">
                    <div>
                      <h3 className="text-[1.05rem] font-bold tracking-tight text-white">
                        {product.title}
                      </h3>
                      <p className="mt-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/40 transition-colors group-hover:text-white/55">
                        {product.detail}
                      </p>
                    </div>
                    <span
                      className="mt-0.5 text-lg text-white/25 transition-colors group-hover:text-red-400"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <InActionSection />
      </main>
      <Footer />
    </>
  );
}
