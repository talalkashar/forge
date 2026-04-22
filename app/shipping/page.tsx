import type { Metadata } from "next";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "Shipping | FORGE",
  description: "Learn how FORGE handles shipping, processing times, and order delivery.",
};

export default function ShippingPage() {
  return (
    <>
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1} className="bg-black px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
            Support
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
            Shipping
          </h1>
          <div className="mt-10 space-y-8 text-base leading-7 text-gray-300">
            <p>
              Orders are typically processed within 1 to 3 business days. Delivery speed depends on the
              shipping method selected at checkout and the destination address.
            </p>
            <p>
              Once your order is fulfilled, you will receive tracking information if it is available for
              your shipment.
            </p>
            <p>
              For shipping questions, reach out to{" "}
              <a className="text-red-500 hover:text-red-400" href="mailto:capacitygears@gmail.com">
                capacitygears@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
