"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/reveal";

const InActionLightbox = dynamic(() => import("./InActionLightbox"), {
  ssr: false,
});

const inActionImages = Object.freeze([
  "/images/wrist strap in use images/IMG_2008.webp",
  "/images/wrist strap in use images/IMG_2009.webp",
  "/images/wrist strap in use images/IMG_2029.webp",
  "/images/wrist strap in use images/IMG_2033.webp",
]);

function InActionSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const visibleImages = inActionImages.slice(0, visibleCount);

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
    const sentinel = loadMoreRef.current;

    if (!sentinel || visibleCount >= inActionImages.length) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((current) =>
          Math.min(current + 3, inActionImages.length),
        );
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount]);

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
      <section className="bg-black px-6 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
              Gallery
            </p>
            <h2 className="text-3xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
              In Action
            </h2>
          </div>

          <div className="columns-1 gap-4 space-y-4 sm:columns-2 xl:columns-3">
            {visibleImages.map((image, index) => (
              <Reveal
                key={image}
                className="mb-4 break-inside-avoid"
                delayMs={index * 60}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group block w-full overflow-hidden rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(6,6,6,1))] text-left shadow-[0_14px_36px_rgba(0,0,0,0.22)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/14 hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)]"
                >
                  <div className="overflow-hidden bg-black">
                    <Image
                      src={image}
                      alt={`Wrist straps in use ${index + 1}`}
                      width={2400}
                      height={1600}
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      quality={70}
                      className="h-auto w-full object-contain transition-[transform,filter] duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
                    />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          <div ref={loadMoreRef} className="h-1 w-full" aria-hidden="true" />

          {visibleCount < inActionImages.length ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + 3, inActionImages.length),
                  )
                }
                className="rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/[0.06]"
              >
                Load More
              </button>
            </div>
          ) : null}
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
