import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping information for FORGE GYM orders.",
};

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              Shipping
            </h1>
          </div>
        </section>
        <section className="px-6 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl space-y-8 text-sm leading-7 text-white/60">
            <div className="border border-white/[0.08] bg-[#080808] p-6">
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-white">
                Processing
              </h2>
              <p className="mt-3">
                Orders are typically prepared after Stripe payment confirms.
                Timing can vary during peak training seasons and restocks.
              </p>
            </div>
            <div className="border border-white/[0.08] bg-[#080808] p-6">
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-white">
                Tracking
              </h2>
              <p className="mt-3">
                When your package ships, tracking is provided by the carrier.
                Check your email (and spam) for updates.
              </p>
            </div>
            <div className="border border-white/[0.08] bg-[#080808] p-6">
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-white">
                Issues
              </h2>
              <p className="mt-3">
                Missing tracking, wrong address, or damaged box? Email{" "}
                <a className="text-white hover:text-red-400" href="mailto:contact@forgegym.us">
                  contact@forgegym.us
                </a>{" "}
                with your order details.
              </p>
            </div>
            <Link href="/returns" className="inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-400">
              Returns policy →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
