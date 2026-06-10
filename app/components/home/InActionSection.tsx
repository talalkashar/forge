"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";
import Reveal from "@/components/ui/reveal";

const InActionLightbox = dynamic(() => import("./InActionLightbox"), {
  ssr: false,
});

type InActionMedia = {
  src: string;
  alt: string;
  className: string;
  imageClassName: string;
  position: string;
  media?: "video";
};

const inActionImages = Object.freeze<InActionMedia[]>([
  {
    src: "/videos/forge-reel.mp4",
    alt: "FORGE Berserk lever belt training reel",
    media: "video",
    className: "h-[25rem] sm:h-[30rem] md:col-span-6 md:row-span-2 md:h-full",
    imageClassName: "object-cover",
    position: "center",
  },
  {
    src: "/videos/forge-gym-trimmed.mp4",
    alt: "FORGE Berserk lever belt deadlift training clip",
    media: "video",
    className: "h-[25rem] sm:h-[30rem] md:col-span-6 md:row-span-2 md:h-full",
    imageClassName: "object-cover",
    position: "center",
  },
  {
    src: "/images/belts/lifestyle/zeus-west-coast-choppers-belt.jpeg",
    alt: "FORGE Zeus lever belt worn during training",
    className: "h-[31rem] sm:h-[36rem] md:col-span-4 md:row-span-2 md:h-full",
    imageClassName: "object-cover",
    position: "center 45%",
  },
  {
    src: "/images/wrist strap in use images/IMG_2029.webp",
    alt: "FORGE wrist straps wrapped around a loaded barbell",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "center 52%",
  },
  {
    src: "/images/wrist strap in use images/IMG_2008.webp",
    alt: "FORGE wrist straps secured around a loaded barbell before a pull",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "52% 56%",
  },
  {
    src: "/images/wrist strap in use images/IMG_2009.webp",
    alt: "FORGE wrist straps on a lifter holding a loaded barbell",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "center 50%",
  },
  {
    src: "/images/wrist strap in use images/IMG_2033.webp",
    alt: "Close detail of FORGE wrist straps wrapped on both wrists",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "center 45%",
  },
]);

function InActionSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const visibleImages = inActionImages;

  const showPreviousImage = useCallback(() => {
    setActiveIndex((current) =>
      current === null
        ? 0
        : (current - 1 + visibleImages.length) % visibleImages.length,
    );
  }, [visibleImages.length]);

  const showNextImage = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? 0 : (current + 1) % visibleImages.length,
    );
  }, [visibleImages.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  return (
    <>
      <section
        id="in-action"
        className="scroll-mt-20 bg-[linear-gradient(180deg,#020202,#080808_45%,#000)] px-6 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
              Gallery
            </p>
            <h2 className="text-3xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
              In Action
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[18rem] lg:auto-rows-[20rem] xl:auto-rows-[21.5rem]">
            {visibleImages.map((image, index) => (
              <Reveal
                key={image.src}
                className={`min-h-0 ${image.className}`}
                delayMs={index * 60}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group relative block h-full w-full overflow-hidden rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] text-left shadow-[0_18px_48px_rgba(0,0,0,0.34)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-red-600/30 hover:shadow-[0_22px_60px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                >
                  {image.media === "video" ? (
                    <video
                      className={`${image.imageClassName} h-full w-full brightness-[0.94] contrast-[1.08] saturate-[1.02] transition-[transform,filter] duration-500 group-hover:scale-[1.035] group-hover:brightness-[1]`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={image.alt}
                    >
                      <source src={image.src} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      priority={index < 2}
                      sizes={
                        index < 2
                          ? "(max-width: 768px) 100vw, 50vw"
                          : "(max-width: 768px) 100vw, 33vw"
                      }
                      quality={86}
                      style={{ objectPosition: image.position }}
                      className={`${image.imageClassName} brightness-[0.94] contrast-[1.08] saturate-[1.02] transition-[transform,filter] duration-500 group-hover:scale-[1.035] group-hover:brightness-[1]`}
                    />
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.01),transparent_50%,rgba(0,0,0,0.16)),radial-gradient(circle_at_50%_12%,rgba(220,38,38,0.08),transparent_34%)]"
                    aria-hidden="true"
                  />
                </button>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {activeIndex !== null ? (
        <InActionLightbox
          images={visibleImages}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onPrevious={showPreviousImage}
          onNext={showNextImage}
        />
      ) : null}
    </>
  );
}

InActionSection.displayName = "InActionSection";

export default memo(InActionSection);
