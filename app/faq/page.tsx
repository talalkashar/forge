import type { Metadata } from "next";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "FAQ | FORGE",
  description: "Answers to common questions about FORGE products, orders, and support.",
};

const faqs = [
  {
    question: "How do I choose the right belt size?",
    answer:
      "Use the size selector on the belt product page and compare your waist measurement to your preferred lifting fit.",
  },
  {
    question: "Do wrist straps come as a pair?",
    answer: "Yes. The wrist straps are sold as a pair.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Email capacitygears@gmail.com and include your order details so we can respond faster.",
  },
];

export default function FAQPage() {
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
            Frequently Asked Questions
          </h1>
          <div className="mt-10 space-y-5">
            {faqs.map((faq) => (
              <section
                key={faq.question}
                className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] p-6"
              >
                <h2 className="text-xl font-bold text-white">{faq.question}</h2>
                <p className="mt-3 text-base leading-7 text-gray-300">{faq.answer}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
