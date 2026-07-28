"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Cache-bust video encodes when replaced. Poster path stays clean for next/image.
const HERO_ASSET_V = "20260722c";
const HERO_VIDEO_MP4 = `/videos/hero/forge-hero-berserk.mp4?v=${HERO_ASSET_V}`;
const HERO_VIDEO_WEBM = `/videos/hero/forge-hero-berserk.webm?v=${HERO_ASSET_V}`;
const HERO_VIDEO_MOBILE_MP4 = `/videos/hero/forge-hero-berserk-mobile.mp4?v=${HERO_ASSET_V}`;
const HERO_VIDEO_MOBILE_WEBM = `/videos/hero/forge-hero-berserk-mobile.webm?v=${HERO_ASSET_V}`;
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

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 1024px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function subscribeMobileViewport(onChange: () => void) {
  const narrow = window.matchMedia("(max-width: 1024px)");
  const coarse = window.matchMedia("(pointer: coarse)");
  narrow.addEventListener("change", onChange);
  coarse.addEventListener("change", onChange);
  return () => {
    narrow.removeEventListener("change", onChange);
    coarse.removeEventListener("change", onChange);
  };
}

function getMobileSnapshot() {
  return isMobileViewport();
}

/** Prefer lighter mobile encode for SSR HTML so phones don't hydrate into the heavy file first. */
function getMobileServerSnapshot() {
  return true;
}

/**
 * Full-viewport cinematic hero — muted looping product video with poster LCP fallback.
 * Poster stays visible until the first real video frame is playing, then a soft crossfade.
 * Reduced-motion users get the static poster only.
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  /** Only reveal video after playback has a painted frame — avoids frozen mid-decode hitch. */
  const [videoRevealed, setVideoRevealed] = useState(false);

  const preferStatic = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const useMobileSources = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  const mp4Src = useMobileSources ? HERO_VIDEO_MOBILE_MP4 : HERO_VIDEO_MP4;
  const webmSrc = useMobileSources ? HERO_VIDEO_MOBILE_WEBM : HERO_VIDEO_WEBM;
  const showVideo = !preferStatic && !videoFailed;

  // Warm the correct encode as early as possible (after we know mobile vs desktop).
  useEffect(() => {
    if (preferStatic || videoFailed) return;
    const href = mp4Src;
    const existing = document.querySelector(
      `link[data-forge-hero-preload="1"]`,
    ) as HTMLLinkElement | null;
    if (existing?.href?.includes(href.split("?")[0] ?? href)) return;

    existing?.remove();
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = href;
    link.setAttribute("data-forge-hero-preload", "1");
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [mp4Src, preferStatic, videoFailed]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || videoFailed || preferStatic) return;

    setVideoRevealed(false);

    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.setAttribute("autoplay", "");

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer2: ReturnType<typeof setTimeout> | undefined;

    const revealWhenFrameReady = () => {
      if (cancelled) return;
      const paint = () => {
        if (!cancelled) setVideoRevealed(true);
      };
      // Wait for an actual painted frame when the browser supports it.
      const videoEl = el as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };
      if (typeof videoEl.requestVideoFrameCallback === "function") {
        videoEl.requestVideoFrameCallback(() => paint());
      } else {
        // Fallback: next frame after playing.
        requestAnimationFrame(() => requestAnimationFrame(paint));
      }
    };

    const tryPlay = () => {
      if (cancelled || document.hidden) return;
      // Always start the loop from the beginning for a clean open.
      if (el.readyState >= 1 && el.currentTime > 0.15 && el.paused) {
        try {
          el.currentTime = 0;
        } catch {
          // ignore seek errors mid-load
        }
      }
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            if (!cancelled) revealWhenFrameReady();
          })
          .catch(() => {
            // Autoplay blocked or buffer empty — keep poster until next attempt.
          });
      }
    };

    const onLoadedMetadata = () => {
      try {
        el.currentTime = 0;
      } catch {
        // ignore
      }
      tryPlay();
    };

    const onPlaying = () => {
      revealWhenFrameReady();
    };

    const onVisibility = () => {
      if (document.hidden) {
        el.pause();
      } else {
        tryPlay();
      }
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (!entry) return;
              if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
                tryPlay();
              } else if (!entry.isIntersecting) {
                el.pause();
              }
            },
            { threshold: [0, 0.15, 0.5, 1] },
          )
        : null;
    io?.observe(el);

    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisibility);

    tryPlay();
    retryTimer = setTimeout(tryPlay, 280);
    retryTimer2 = setTimeout(tryPlay, 900);

    const unlock = () => {
      tryPlay();
    };
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    window.addEventListener("pointerdown", unlock, { passive: true, once: true });

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (retryTimer2) clearTimeout(retryTimer2);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      io?.disconnect();
    };
  }, [videoFailed, preferStatic, useMobileSources, mp4Src]);

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      aria-label="FORGE GYM hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {/* Poster always under video for LCP + seamless hold until video paints */}
          <Image
            src={HERO_POSTER}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%]"
            aria-hidden="true"
          />
          {showVideo ? (
            <video
              ref={videoRef}
              key={useMobileSources ? "mobile" : "desktop"}
              className={`absolute inset-0 h-full w-full bg-transparent object-cover object-[center_36%] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:object-[center_40%] lg:object-[center_42%] ${
                videoRevealed ? "opacity-100" : "opacity-0"
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              disableRemotePlayback
              onError={() => {
                setVideoFailed(true);
                setVideoRevealed(false);
              }}
            >
              {/* #t=0.001 nudges some browsers to decode from the start, not a random keyframe */}
              <source src={`${mp4Src}#t=0.001`} type="video/mp4" />
              <source src={`${webmSrc}#t=0.001`} type="video/webm" />
            </video>
          ) : null}
          {preferStatic || videoFailed ? (
            <span className="sr-only">
              FORGE Berserk lever belt cinematic product showcase
            </span>
          ) : null}
        </div>
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
        <div className="mx-auto w-full max-w-7xl px-5 pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-24 sm:px-8 sm:pb-32 lg:pb-36">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
              <span className="h-px w-8 bg-red-500 sm:w-12" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-red-400">
                FORGE GYM
              </p>
              <span className="h-px w-8 bg-red-500 sm:w-12" aria-hidden="true" />
            </div>

            <h1 className="text-[clamp(2.75rem,11vw,7.2rem)] font-black leading-[0.84] tracking-[-0.04em] text-white [text-wrap:balance]">
              Built for
              <span className="mt-1 block text-red-500">heavy lifts.</span>
            </h1>

            <p className="mt-5 max-w-md text-[0.98rem] leading-7 text-white/90 sm:mt-7 sm:text-lg sm:leading-8">
              FORGE GYM lever belts and wrist straps for serious training: rigid
              support, clean hardware, zero soft branding.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
              <Link
                href="/shop/belts"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 active:bg-red-500 sm:w-auto"
              >
                Shop Belts
              </Link>
              <Link
                href="/shop/wrist-straps"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 bg-white/[0.03] px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out hover:border-white/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 active:bg-white/[0.08] sm:w-auto"
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
