import type { Metadata } from "next";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | FORGE",
  description: "Read how FORGE handles customer information and protects your privacy.",
};

export default function PrivacyPage() {
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
            Legal
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <div className="mt-10 space-y-8 text-base leading-7 text-gray-300">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">What We Collect</h2>
              <p>
                FORGE collects the information required to process orders, respond to support requests,
                and improve the website experience. This may include your name, email address, shipping
                details, and basic analytics data.
              </p>
            </section>
            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">How We Use It</h2>
              <p>
                We use customer information to fulfill orders, communicate about purchases, and support
                legitimate business operations. We do not sell personal information.
              </p>
            </section>
            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">Questions</h2>
              <p>
                If you have privacy questions, contact{" "}
                <a className="text-red-500 hover:text-red-400" href="mailto:capacitygears@gmail.com">
                  capacitygears@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
