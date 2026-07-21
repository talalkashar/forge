import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy practices for FORGE GYM.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-500">
              FORGE GYM™
            </p>
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              Privacy
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/50">
              How we handle information when you shop FORGE GYM.
            </p>
          </div>
        </section>
        <section className="px-6 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl space-y-6 text-sm leading-7 text-white/60">
            <p>
              We collect information needed to process orders, support customers,
              and improve the storefront — such as contact details and checkout
              data handled by Stripe.
            </p>
            <p>
              Payment card data is processed by Stripe. FORGE GYM does not store
              full card numbers on our servers.
            </p>
            <p>
              We do not sell your personal information. We may use service
              providers (hosting, email, analytics) solely to operate the site.
            </p>
            <p>
              Questions? Email{" "}
              <a className="text-white hover:text-red-400" href="mailto:contact@forgegym.us">
                contact@forgegym.us
              </a>
              .
            </p>
            <Link href="/contact" className="inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-400">
              Contact →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
