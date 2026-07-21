import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Sizing, shipping, returns, and product questions for FORGE GYM.",
};

const faqs = [
  {
    q: "How do I choose a belt size?",
    a: "Measure around your waist at the navel (where the belt sits), not pants size. If you are between sizes, size down for a firmer brace. Full chart is on every belt product page.",
  },
  {
    q: "What is the belt thickness?",
    a: "FORGE lever belts use a 10mm core with a 4-inch width — built for heavy squats and deadlifts.",
  },
  {
    q: "Zeus vs Berserk vs Black?",
    a: "Same lever platform and support. Different finishes only. Pick the look you want; bracing stays consistent.",
  },
  {
    q: "Do wrist straps come as a pair?",
    a: "Yes. FORGE lifting straps ship as a pair with padded wrist support.",
  },
  {
    q: "How does checkout work?",
    a: "Cart checkout runs through Stripe. You will get payment confirmation from Stripe; shipping details follow when fulfillment updates.",
  },
  {
    q: "Shipping & returns?",
    a: "See Shipping and Returns pages for current policy. Contact contact@forgegym.us for order-specific questions.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              FAQ
            </h1>
          </div>
        </section>
        <section className="px-6 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border border-white/[0.08] bg-[#080808] open:border-white/20"
              >
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-white marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-white/35 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="border-t border-white/[0.06] px-5 py-4 text-sm leading-6 text-white/55">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-3xl border border-white/[0.08] p-6 text-center">
            <p className="text-sm text-white/50">Still stuck?</p>
            <Link
              href="/contact"
              className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-400 hover:text-red-300"
            >
              Contact support →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
