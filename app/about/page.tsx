import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "About",
  description:
    "FORGE GYM builds premium 10mm lever belts and wrist straps for heavy, disciplined training.",
};

const pillars = [
  {
    title: "Brace",
    body: "10mm lever belts built to lock in under squats and pulls — rigid core, fast setup.",
  },
  {
    title: "Grip",
    body: "Wrist straps for high-volume back work when your hands give out before your back does.",
  },
  {
    title: "No soft brand",
    body: "Clean hardware. Dark storefront. Zero gimmick marketing. Just gear for heavy work.",
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
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              Strength gear for people who actually lift.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
              FORGE GYM makes lever belts and wrist straps for heavy, disciplined
              training. We care about bracing, grip, and build quality — not
              hype drops or soft lifestyle filler.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-red-600 px-7 py-3.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
              >
                Shop gear
              </Link>
              <Link
                href="/shop/belts"
                className="rounded-full border border-white/15 px-7 py-3.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
              >
                Lever belts
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
            {pillars.map((item) => (
              <div
                key={item.title}
                className="border border-white/[0.08] bg-[#080808] p-6"
              >
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-400">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.body}</p>
              </div>
            ))}
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
                The standard
              </p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                One platform. Three finishes.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/50">
                Zeus, Berserk, and Black share the same 10mm lever platform.
                Pick the finish that fits your gym — keep the brace, speed, and
                structure identical.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                <li>· 10mm thickness · 4&quot; width</li>
                <li>· Lever closure for repeatable setup</li>
                <li>· Secure Stripe checkout</li>
              </ul>
              <Link
                href="/shop/belts"
                className="mt-8 inline-flex rounded-full border border-white/15 px-6 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
              >
                Shop lever belts →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
