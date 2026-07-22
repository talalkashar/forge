import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "About",
  description:
    "FORGE GYM makes lever belts and wrist straps that actually work — support for heavy sets, built to protect and push hard.",
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
                We built FORGE because we wanted gym accessories that actually
                work — gear with a clear purpose, not noise on a shelf. Lever
                belts and wrist straps that help you brace, hold on, and train
                with intent.
              </p>
              <p>
                The goal is simple: help lifters stay protected under heavy
                loads and go as hard as possible on every set. Better support
                means more confidence under the bar, cleaner reps, and fewer
                sessions cut short by a weak brace or failing grip.
              </p>
              <p>
                That&apos;s why we stay focused on the essentials. No filler
                products — just equipment made to serve the work.
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
