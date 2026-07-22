import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "About",
  description:
    "FORGE GYM builds 10mm lever belts and wrist straps for heavy strength training. Capacity Gears LLC.",
};

const pillars = [
  {
    title: "Lever belts",
    body: "10mm leather, 4\" width, steel lever closure. Same platform across Zeus, Berserk, and Black — choose the finish, keep the brace.",
  },
  {
    title: "Wrist straps",
    body: "Heavy-duty straps for deadlifts, rows, and high-volume pull work when grip fails before your back does.",
  },
  {
    title: "Built to train",
    body: "We design for people who load the bar week after week — clear sizing, secure checkout, and gear that holds up under real sessions.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
              About FORGE
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              Gear for heavy strength work.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
              FORGE GYM is a strength equipment brand under Capacity Gears LLC.
              We make lever belts and wrist straps for lifters who care about a
              solid brace, dependable grip, and equipment that shows up every
              session — not trends.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-red-600 px-7 py-3.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
              >
                Shop gear
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/15 px-7 py-3.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-2xl font-black tracking-tight text-white sm:text-3xl">
              What we make
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {pillars.map((item) => (
                <div
                  key={item.title}
                  className="border border-white/[0.08] bg-[#080808] p-6"
                >
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-400">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/55">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden border border-white/[0.08] bg-neutral-950">
              <Image
                src="/images/belts/listing/berserk/1-hero.jpg"
                alt="FORGE GYM Berserk lever belt"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={86}
                className="object-contain p-8"
              />
            </div>
            <div>
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
                Lever belt platform
              </p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                One belt build. Three finishes.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/50">
                Zeus, Berserk, and Black share the same 10mm lever construction.
                Pick the look that fits you — thickness, width, and lever setup
                stay the same so sizing and feel stay consistent.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                <li>· 10mm thickness · 4&quot; width</li>
                <li>· Steel lever closure for a fast, repeatable lock-in</li>
                <li>· Sizes S–XXL — measure at the navel, not pant size</li>
                <li>· Checkout secured by Stripe</li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop/belts"
                  className="inline-flex rounded-full bg-red-600 px-6 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
                >
                  Shop lever belts
                </Link>
                <Link
                  href="/shop/wrist-straps"
                  className="inline-flex rounded-full border border-white/15 px-6 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
                >
                  Wrist straps
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl border border-white/[0.08] bg-[#080808] p-8 sm:p-10">
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Questions about sizing or orders?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/50 sm:text-base">
                Check the FAQ for sizing and shipping, or email us — we keep
                support simple and direct.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/faq"
                  className="rounded-full border border-white/15 px-6 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
                >
                  FAQ
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full bg-red-600 px-6 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
                >
                  Contact
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
