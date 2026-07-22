"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Cache-bust video encodes when replaced. Poster path stays clean for next/image.
const HERO_ASSET_V = "20260722b";
const HERO_VIDEO_MP4 = `/videos/hero/forge-hero-berserk.mp4?v=${HERO_ASSET_V}`;
const HERO_VIDEO_WEBM = `/videos/hero/forge-hero-berserk.webm?v=${HERO_ASSET_V}`;
const HERO_POSTER = "/videos/posters/forge-hero-berserk.jpg";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Full-viewport cinematic hero , muted looping product video with poster LCP fallback.
 * Reduced-motion users get the static poster only.
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const preferStatic = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el || videoFailed || preferStatic) return;

    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;

    const tryPlay = () => {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay blocked , poster / first frame still visible.
        });
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        el.pause();
      } else {
        tryPlay();
      }
    };

    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", onVisibility);
    tryPlay();

    return () => {
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [videoFailed, preferStatic]);

  const showVideo = !preferStatic && !videoFailed;

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      aria-label="FORGE GYM hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/*
          Delivery is 1920×1920 (Lanczos upscale from 960 native). object-cover fills:
          - mobile portrait crops left/right → keep subject centered
          - desktop landscape crops top/bottom → bias slightly upper (face print / red eye)
        */}
        <div className="absolute inset-0">
          {showVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full bg-black object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%]"
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onError={() => setVideoFailed(true)}
            >
              <source src={HERO_VIDEO_WEBM} type="video/webm" />
              <source src={HERO_VIDEO_MP4} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={HERO_POSTER}
              alt="FORGE Berserk lever belt cinematic product showcase"
              fill
              priority
              sizes="100vw"
              quality={90}
              className="object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%]"
            />
          )}
        </div>
        {/* Lighter scrims so product video stays clearer; stronger top on mobile for nav/copy */}
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.55)_34%,rgba(0,0,0,0.16)_58%,rgba(0,0,0,0.4)_100%)] sm:bg-[linear-gradient(105deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_36%,rgba(0,0,0,0.12)_58%,rgba(0,0,0,0.4)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,transparent_28%,transparent_52%,rgba(0,0,0,0.82)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,transparent_30%,transparent_55%,rgba(0,0,0,0.78)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_36%,rgba(160,20,20,0.12),transparent_48%)]"
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-24 sm:px-8 sm:pb-32 lg:pb-36">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
              <span className="h-px w-8 bg-red-500 sm:w-12" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-red-400">
                Premium gear
              </p>
              <span className="h-px w-8 bg-red-500 sm:w-12" aria-hidden="true" />
            </div>

            <h1 className="text-[clamp(3rem,11vw,7.2rem)] font-black leading-[0.84] tracking-[-0.04em] text-white">
              Built for
              <span className="mt-1 block text-red-500">heavy lifts.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/90 sm:mt-7 sm:text-lg sm:leading-8">
              Lever belts and wrist straps for serious training: rigid support,
              clean hardware, zero soft branding.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
              <Link
                href="/shop/belts"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 sm:w-auto"
              >
                Shop Belts
              </Link>
              <Link
                href="/shop/wrist-straps"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 bg-white/[0.03] px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-white/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 sm:w-auto"
              >
                Shop Straps
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
