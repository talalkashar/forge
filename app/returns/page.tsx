import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "Returns",
  description: "Returns policy for FORGE GYM gear.",
};

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              Returns
            </h1>
          </div>
        </section>
        <section className="px-6 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl space-y-6 text-sm leading-7 text-white/60">
            <p>
              If your order arrives damaged, incorrect, or defective, contact{" "}
              <a className="text-white hover:text-red-400" href="mailto:contact@forgegym.us">
                contact@forgegym.us
              </a>{" "}
              with photos and your order ID. We will sort a replacement or refund path based on the case.
            </p>
            <p>
              Unused items in original condition may be eligible for return
              within the stated policy window. Worn training gear generally
              cannot be resold — hygiene and safety first.
            </p>
            <p>
              Approved returns need a return authorization before shipping
              anything back. Do not send packages without confirmation.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/contact" className="text-xs font-black uppercase tracking-[0.16em] text-red-400">
                Contact →
              </Link>
              <Link href="/shipping" className="text-xs font-black uppercase tracking-[0.16em] text-white/50 hover:text-white">
                Shipping →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
