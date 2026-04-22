"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { memo, useEffect } from "react";

function InActionLightbox({
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
}: {
  images: string[];
  activeIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const activeImage = images[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        onPrevious();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
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
        className="absolute left-4 top-1/2 z-[101] -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-3 text-white transition-colors hover:bg-black/85 sm:left-6"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="absolute right-4 top-1/2 z-[101] -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-3 text-white transition-colors hover:bg-black/85 sm:right-6"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div
        className="relative z-[101] max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[1.5rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[102] rounded-full border border-white/10 bg-black/60 p-2 text-white transition-colors hover:bg-black/85"
          aria-label="Close image preview"
        >
          <X className="h-5 w-5" />
        </button>
        <Image
          src={activeImage}
          alt="Wrist straps in use fullscreen preview"
          width={2400}
          height={1600}
          quality={80}
          priority
          className="h-auto max-h-[92vh] w-full object-contain"
        />
      </div>
    </div>
  );
}

InActionLightbox.displayName = "InActionLightbox";

export default memo(InActionLightbox);
