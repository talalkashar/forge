"use client";

import dynamic from "next/dynamic";

const Hero = dynamic(() => import("./Hero"), {
  ssr: false,
  loading: () => <div className="hero-loading-shell" aria-hidden="true" />,
});

export default function HeroSlot() {
  return (
    <>
      <Hero />

      <style jsx global>{`
        .hero-loading-shell {
          min-height: min(100vh, 980px);
          height: calc(100vh - 4rem);
          width: 100%;
          background:
            radial-gradient(circle at 18% 22%, rgba(255, 58, 58, 0.24), transparent 34%),
            radial-gradient(circle at 82% 18%, rgba(153, 0, 0, 0.22), transparent 32%),
            radial-gradient(circle at 52% 78%, rgba(110, 0, 0, 0.18), transparent 40%),
            linear-gradient(135deg, #020202 0%, #120202 42%, #050505 72%, #000000 100%);
        }

        @media (max-width: 768px) {
          .hero-loading-shell {
            min-height: calc(100vh - 4rem);
          }
        }
      `}</style>
    </>
  );
}
