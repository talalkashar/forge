import type { Metadata } from "next";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "Returns | FORGE",
  description: "View the FORGE return policy and support process.",
};

export default function ReturnsPage() {
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
            Returns
          </h1>
          <div className="mt-10 space-y-8 text-base leading-7 text-gray-300">
            <p>
              If there is an issue with your order, contact FORGE support as soon as possible with your
              order details and a short description of the problem.
            </p>
            <p>
              Return eligibility depends on the condition of the product and the time since delivery. We
              review each request individually so we can respond fairly and quickly.
            </p>
            <p>
              Start a return request by emailing{" "}
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
