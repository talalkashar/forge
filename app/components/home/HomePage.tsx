import dynamic from "next/dynamic";
import Footer from "./Footer";
import HeroSlot from "./HeroSlot";
import Navbar from "./Navbar";

const LifestyleSection = dynamic(() => import("./LifestyleSection"), {
  loading: () => (
    <section
      className="min-h-[720px] bg-gradient-to-b from-black via-[#050505] to-neutral-950"
      aria-hidden="true"
    />
  ),
});

const InActionSection = dynamic(() => import("./InActionSection"), {
  loading: () => <section className="min-h-[420px] bg-black" aria-hidden="true" />,
});

export default function HomePage() {
  return (
    <>
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1}>
        <div className="min-h-screen">
          <HeroSlot />
        </div>
        <LifestyleSection />
        <InActionSection />
      </main>
      <Footer />
    </>
  );
}
