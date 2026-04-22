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
    text: "We source only the highest quality materials, tested for durability and performance under extreme conditions.",
  },
  {
    title: "Athlete-Tested",
    text: "Every product is tested by real athletes in real training environments before it reaches you.",
  },
  {
    title: "No Compromises",
    text: "We refuse to cut corners. Quality, performance, and durability are non-negotiable.",
  },
  {
    title: "Built to Last",
    text: "FORGE gear is designed to withstand years of heavy use, not just a few training cycles.",
  },
];

export default function AboutPage() {
  return (
    <>
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1}>
        <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 fade-in-up">
              Our <span className="text-red-600">Story</span>
            </h1>
            <p className="text-xl text-gray-400 fade-in-up-delay-1">
              Built for the relentless. Engineered for excellence.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="animate-on-scroll animated">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">The Beginning</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  FORGE was born from frustration. As serious athletes, we were tired of gear that promised performance
                  but delivered disappointment. We needed equipment that could keep up with our intensity, our dedication,
                  and our refusal to accept limitations.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  So we decided to build it ourselves. Every product in the FORGE lineup is designed by athletes, for athletes.
                  We test every material, every stitch, every design decision against one simple question: &quot;Would I trust this
                  when I&apos;m pushing my absolute limit?&quot;
                </p>
              </div>

              <div className="animate-on-scroll animated">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">Our Mission</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  At FORGE, we believe your gear should never be the weak link. Whether you&apos;re pulling 500 pounds from
                  the floor, pressing overhead, or grinding through your final rep, your equipment should be as committed
                  to performance as you are.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  We&apos;re not here to make gear that only looks good online. We&apos;re here to build equipment that performs
                  when it matters most: when you&apos;re one rep from failure, when your grip is slipping, and when you need
                  one more edge to break through a plateau.
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
                  FORGE isn&apos;t just a brand. It&apos;s a community of athletes who refuse to settle. We&apos;re powerlifters,
                  bodybuilders, strongmen, and disciplined lifters who understand that greatness isn&apos;t given. It&apos;s
                  forged through consistency, intent, and hard work.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  When you choose FORGE, you&apos;re choosing gear built to match serious training. It&apos;s a commitment to
                  strength that lasts and standards that hold up under pressure.
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
