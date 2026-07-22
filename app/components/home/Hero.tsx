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
  // Phones + tablets share the lighter encode; desktop keeps higher-res loop.
  return (
    window.matchMedia("(max-width: 1024px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/**
 * Full-viewport cinematic hero — muted looping product video with poster LCP fallback.
 * Reduced-motion users get the static poster only.
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  // pending until mount so we never start the wrong (heavy) encode on phones
  const [sourceMode, setSourceMode] = useState<"pending" | "mobile" | "desktop">(
    "pending",
  );
  const preferStatic = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    setSourceMode(isMobileViewport() ? "mobile" : "desktop");
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || videoFailed || preferStatic || sourceMode === "pending") return;

    // iOS Safari autoplay requires muted + playsInline as real attributes, not only props.
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.setAttribute("autoplay", "");

    let cancelled = false;
    let retryTimer: number | undefined;

    const tryPlay = () => {
      if (cancelled || document.hidden) return;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay blocked or not enough data yet — keep poster/first frame.
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

    // Pause off-screen so scroll stays smooth on mid-range phones.
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (!entry) return;
              if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
                tryPlay();
              } else {
                el.pause();
              }
            },
            { threshold: [0, 0.2, 0.5, 1] },
          )
        : null;
    io?.observe(el);

    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("canplaythrough", tryPlay);
    document.addEventListener("visibilitychange", onVisibility);

    // Kick load + play early; retry once after a short buffer window for slow mobile nets.
    try {
      el.load();
    } catch {
      // ignore
    }
    tryPlay();
    retryTimer = window.setTimeout(tryPlay, 400);
    const retryTimer2 = window.setTimeout(tryPlay, 1200);

    // One-time unlock if a policy still blocks until first gesture (rare for muted).
    const unlock = () => {
      tryPlay();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    window.addEventListener("pointerdown", unlock, { passive: true, once: true });

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      window.clearTimeout(retryTimer2);
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("canplaythrough", tryPlay);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      io?.disconnect();
    };
  }, [videoFailed, preferStatic, sourceMode]);

  const showVideo =
    !preferStatic && !videoFailed && sourceMode !== "pending";
  const useMobileSources = sourceMode === "mobile";
  const mp4Src = useMobileSources ? HERO_VIDEO_MOBILE_MP4 : HERO_VIDEO_MP4;
  const webmSrc = useMobileSources ? HERO_VIDEO_MOBILE_WEBM : HERO_VIDEO_WEBM;

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      aria-label="FORGE GYM hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/*
          Delivery is square product loop. object-cover fills:
          - mobile portrait crops left/right → keep subject centered
          - desktop landscape crops top/bottom → bias slightly upper (face print / red eye)
        */}
        <div className="absolute inset-0">
          {/* Poster always under video for LCP + instant first paint */}
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
              key={sourceMode}
              className="absolute inset-0 h-full w-full bg-black object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%]"
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              // auto: hero is LCP-adjacent motion; mobile uses lighter encode
              preload="auto"
              aria-hidden="true"
              // Disable remote playback UI noise on some mobile browsers
              disableRemotePlayback
              onError={() => setVideoFailed(true)}
            >
              {/* MP4 first: iOS Safari does not play WebM and should not waste a probe. */}
              <source src={mp4Src} type="video/mp4" />
              <source src={webmSrc} type="video/webm" />
            </video>
          ) : null}
          {preferStatic || videoFailed ? (
            <span className="sr-only">
              FORGE Berserk lever belt cinematic product showcase
            </span>
          ) : null}
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
        <div className="mx-auto w-full max-w-7xl px-5 pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-24 sm:px-8 sm:pb-32 lg:pb-36">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
              <span className="h-px w-8 bg-red-500 sm:w-12" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-red-400">
                Premium gear
              </p>
              <span className="h-px w-8 bg-red-500 sm:w-12" aria-hidden="true" />
            </div>

            <h1 className="text-[clamp(2.75rem,11vw,7.2rem)] font-black leading-[0.84] tracking-[-0.04em] text-white [text-wrap:balance]">
              Built for
              <span className="mt-1 block text-red-500">heavy lifts.</span>
            </h1>

            <p className="mt-5 max-w-md text-[0.98rem] leading-7 text-white/90 sm:mt-7 sm:text-lg sm:leading-8">
              Lever belts and wrist straps for serious training: rigid support,
              clean hardware, zero soft branding.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
              <Link
                href="/shop/belts"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 active:bg-red-500 sm:w-auto"
              >
                Shop Belts
              </Link>
              <Link
                href="/shop/wrist-straps"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 bg-white/[0.03] px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-white/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 active:bg-white/[0.08] sm:w-auto"
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
