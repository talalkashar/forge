"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/reveal";

const InActionLightbox = dynamic(
  () => import("./InActionLightbox").then((mod) => mod.default),
  { ssr: false },
);

type InActionMedia = {
  src: string;
  alt: string;
  className: string;
  imageClassName: string;
  position: string;
  media?: "video";
  poster?: string;
};

const inActionImages = Object.freeze<InActionMedia[]>([
  {
    src: "/videos/forge-reel.mp4",
    poster: "/videos/posters/forge-reel.jpg",
    alt: "FORGE Berserk lever belt training reel",
    media: "video",
    className: "h-[25rem] sm:h-[30rem] md:col-span-6 md:row-span-2 md:h-full",
    imageClassName: "object-cover",
    position: "center",
  },
  {
    src: "/videos/forge-gym-trimmed.mp4",
    poster: "/videos/posters/forge-gym-trimmed.jpg",
    alt: "FORGE Berserk lever belt deadlift training clip",
    media: "video",
    className: "h-[25rem] sm:h-[30rem] md:col-span-6 md:row-span-2 md:h-full",
    imageClassName: "object-cover",
    position: "center",
  },
  {
    src: "/images/belts/lifestyle/berserk-belt-front-detail.jpeg",
    alt: "Close detail of the FORGE Berserk lever belt",
    className: "h-[31rem] sm:h-[36rem] md:col-span-4 md:row-span-2 md:h-full",
    imageClassName: "object-cover",
    position: "center 40%",
  },
  {
    // Midnight-graded lifestyle stills (matched to Training videos cooler grade).
    src: "/images/straps/lifestyle/in-action/straps-deadlift-setup.jpg",
    alt: "FORGE wrist straps wrapped around a loaded barbell",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "center 52%",
  },
  {
    src: "/images/straps/lifestyle/in-action/straps-deadlift-grip.jpg",
    alt: "FORGE wrist straps secured around a loaded barbell before a pull",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "52% 56%",
  },
  {
    src: "/images/straps/lifestyle/in-action/straps-deadlift-stance.jpg",
    alt: "FORGE wrist straps on a lifter holding a loaded barbell",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "center 50%",
  },
  {
    src: "/images/straps/lifestyle/in-action/straps-wrists-closeup.jpg",
    alt: "Close detail of FORGE wrist straps wrapped on both wrists",
    className: "h-[22rem] sm:h-[24rem] md:col-span-4 md:h-full",
    imageClassName: "object-cover",
    position: "center 45%",
  },
]);

function GridVideo({
  src,
  poster,
  alt,
  objectClassName,
}: {
  src: string;
  poster?: string;
  alt: string;
  objectClassName: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || failed) return;

    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;

    const tryPlay = () => {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay blocked — poster / first frame still visible.
        });
      }
    };

    // Restart playback when the source becomes ready (Safari/Chrome both need this).
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => {
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
    };
  }, [src, failed]);

  if (failed && poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${objectClassName}`}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full bg-[#080808] ${objectClassName}`}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label={alt}
      onError={() => setFailed(true)}
    />
  );
}

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
        className="scroll-mt-20 border-t border-white/[0.06] bg-black px-6 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-12">
            <h2 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              Training
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:auto-rows-[18rem] md:gap-3 lg:auto-rows-[20rem] xl:auto-rows-[21.5rem]">
            {visibleImages.map((image, index) => (
              <Reveal
                key={image.src}
                className={`min-h-0 ${image.className}`}
                delayMs={Math.min(index * 30, 120)}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group relative block h-full w-full overflow-hidden border border-white/[0.08] bg-[#080808] text-left transition-colors duration-150 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                >
                  {image.media === "video" ? (
                    <GridVideo
                      src={image.src}
                      poster={image.poster}
                      alt={image.alt}
                      objectClassName={image.imageClassName}
                    />
                  ) : (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      loading={index < 2 ? "eager" : "lazy"}
                      sizes={
                        index < 2
                          ? "(max-width: 768px) 100vw, 50vw"
                          : "(max-width: 768px) 100vw, 33vw"
                      }
                      quality={70}
                      style={{ objectPosition: image.position }}
                      className={image.imageClassName}
                    />
                  )}
                  {image.media === "video" ? (
                    <span className="pointer-events-none absolute bottom-3 left-3 z-[1] border border-white/15 bg-black/65 px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-white/80">
                      Video
                    </span>
                  ) : null}
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
