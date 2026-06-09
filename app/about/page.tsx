import type { Metadata } from "next";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

export const metadata: Metadata = {
  title: "About | FORGE",
  description: "Learn the story, standards, and training philosophy behind FORGE.",
};

const storyCards = [
  {
    title: "Premium Materials",
    text: "Our product pages list the materials and specs currently available for each FORGE item.",
  },
  {
    title: "Training-Focused",
    text: "FORGE gear is positioned around the lifts it is meant to support: bracing, pulling, and repeated heavy sessions.",
  },
  {
    title: "No Compromises",
    text: "The store keeps sizing, pricing, inventory, and checkout details visible before purchase.",
  },
  {
    title: "Clear Support",
    text: "Shipping, returns, privacy, FAQ, and contact pages are available from the storefront footer.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main>
        <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 fade-in-up">
              Our <span className="text-red-600">Story</span>
            </h1>
            <p className="text-xl text-gray-400 fade-in-up-delay-1">
              Strength gear with clear sizing, real product details, and secure checkout.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="animate-on-scroll animated">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">The Beginning</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  FORGE focuses on lifting gear for disciplined training: lever belts for bracing and wrist straps for
                  heavy pulls. The store is built around clear product paths, straightforward specs, and live catalog data.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  The current lineup is intentionally narrow so each product can have its own sizing, images, availability,
                  and checkout path without hiding important purchase details.
                </p>
              </div>

              <div className="animate-on-scroll animated">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">Our Mission</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  At FORGE, the goal is to keep the buying experience as focused as the training itself. Product pages
                  should make it easy to understand what is included, what size is available, and what happens at checkout.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  As the catalog grows, FORGE can add more proof points only when they are real: verified reviews,
                  tested policies, and confirmed marketplace or federation details.
                </p>
              </div>

              <div className="animate-on-scroll animated">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">What Makes Us Different</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {storyCards.map((card) => (
                    <div key={card.title} className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                      <p className="text-gray-400">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-on-scroll animated">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">Join the FORGE</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  FORGE is for lifters who want a direct path to the gear they need without inflated claims or confusing
                  product options.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  When you choose FORGE, you should be able to see the product, select the right option, and check out
                  with confidence in the details shown on the page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
