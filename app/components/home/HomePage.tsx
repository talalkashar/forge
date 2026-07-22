import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
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

const products = [
  {
    title: "Berserk Lever Belt",
    detail: "10mm · Lever · $79.97",
    href: "/product/belt?variant=berserk",
    image: "/images/belts/listing/berserk/main.jpg",
  },
  {
    title: "Zeus Lever Belt",
    detail: "10mm · Lever · $79.97",
    href: "/product/belt?variant=zeus",
    image: "/images/belts/listing/zeus/main.jpg",
  },
  {
    title: "Black Lever Belt",
    detail: "10mm · Lever · $79.97",
    href: "/product/belt?variant=black",
    image: "/images/belts/listing/black/1.jpg",
  },
  {
    title: "Wrist Straps",
    detail: "Padded · Pair · $9.99",
    href: "/product/straps",
    image: "/images/straps/listing/gallery-v4-1.png",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSlot />

        <section className="border-y border-white/[0.06] bg-[#050505]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/[0.06] sm:grid-cols-4">
            {trustPoints.map((item) => (
              <div
                key={item.label}
                className="bg-black px-5 py-5 sm:px-6 sm:py-6"
              >
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-400">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-white/55">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="shop-collections"
          className="border-t border-white/[0.06] bg-black px-6 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
                  Shop
                </p>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
                  Gear
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
              {products.map((product) => (
                <Link
                  key={product.title}
                  href={product.href}
                  className="group flex h-full flex-col overflow-hidden border border-white/[0.08] bg-black transition-colors duration-150 hover:border-white/25"
                >
                  <div className="relative aspect-square overflow-hidden bg-black">
                    <div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(90,12,12,0.2),transparent_58%)]"
                      aria-hidden="true"
                    />
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      quality={90}
                      className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.03] sm:p-2"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3 p-5">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
                        {product.detail}
                      </p>
                    </div>
                    <span
                      className="mt-0.5 text-white/30 transition-colors group-hover:text-white"
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
