import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "About",
  description:
    "FORGE GYM makes lever belts and wrist straps for heavy strength training — simple gear, built with intention.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl">
            <p className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
              About
            </p>
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">
              Why FORGE exists.
            </h1>

            <div className="mt-10 space-y-6 text-base leading-8 text-white/55 sm:text-lg sm:leading-9">
              <p>
                We started FORGE because a lot of lifting gear either feels
                overbuilt for show or underbuilt for real work. We wanted the
                opposite: simple tools that do one job well when the bar is
                loaded.
              </p>
              <p>
                So we make lever belts and wrist straps — nothing else. No
                filler products, no seasonal drops, no lifestyle theater. Just
                equipment for heavy training, designed to be clear to size, hard
                to break in use, and easy to buy.
              </p>
              <p>
                If you brace hard, pull heavy, and care more about sessions than
                hype, you&apos;re who this brand is for.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-3">
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
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
