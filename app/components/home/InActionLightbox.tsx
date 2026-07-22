"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FixedPortal } from "@/app/components/providers/FixedPortal";

function InActionLightbox({
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
}: {
  images: ReadonlyArray<{
    src: string;
    alt: string;
    media?: "video";
    poster?: string;
  }>;
  activeIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const activeImage = images[activeIndex];
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || activeImage.media !== "video") return;

    el.muted = true;
    el.defaultMuted = true;
    el.load();
    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // User can hit play via native controls.
      });
    }
  }, [activeImage.media, activeImage.src, activeIndex]);

  return (
    <FixedPortal>
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close image preview"
      />

      <button
        type="button"
        onClick={onPrevious}
        className="absolute left-3 top-1/2 z-[101] -translate-y-1/2 border border-white/15 bg-black/60 p-3 text-white transition-colors hover:bg-black/85 sm:left-6"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="absolute right-3 top-1/2 z-[101] -translate-y-1/2 border border-white/15 bg-black/60 p-3 text-white transition-colors hover:bg-black/85 sm:right-6"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div
        className="relative z-[101] max-h-[92vh] w-full max-w-5xl overflow-hidden border border-white/10 bg-black"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute left-4 top-4 z-[102] text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/50">
          {activeIndex + 1} of {images.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[102] border border-white/15 bg-black/60 p-2 text-white transition-colors hover:bg-black/85"
          aria-label="Close image preview"
        >
          <X className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.src}
            initial={prefersReducedMotion ? false : { opacity: 0.4, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.4, scale: 1.01 }}
            transition={{ duration: 0.22 }}
            className="relative"
          >
            {activeImage.media === "video" ? (
              <video
                ref={videoRef}
                key={activeImage.src}
                className="max-h-[92vh] w-full bg-black object-contain"
                src={activeImage.src}
                poster={activeImage.poster}
                autoPlay
                controls
                loop
                muted
                playsInline
                preload="auto"
                aria-label={activeImage.alt}
              />
            ) : (
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                width={1600}
                height={1200}
                sizes="100vw"
                quality={86}
                className="max-h-[92vh] w-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
    </FixedPortal>
  );
}

export default memo(InActionLightbox);
