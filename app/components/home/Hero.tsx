"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Hero media — prefer the light encode for everyone so the loop starts ASAP.
 * Desktop 4MB file was the main delay on first paint.
 */
const HERO_ASSET_V = "20260728a";
const HERO_VIDEO_MP4 = `/videos/hero/forge-hero-berserk-mobile.mp4?v=${HERO_ASSET_V}`;
const HERO_VIDEO_WEBM = `/videos/hero/forge-hero-berserk-mobile.webm?v=${HERO_ASSET_V}`;
/** Optional hi-res for large fine-pointer screens after first paint (progressive). */
const HERO_VIDEO_HIRES_MP4 = `/videos/hero/forge-hero-berserk.mp4?v=${HERO_ASSET_V}`;
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

/** True only after client hydration (avoids SSR source mismatches). */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function wantsHiResUpgrade() {
  return (
    window.matchMedia("(min-width: 1280px)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Full-viewport cinematic hero.
 * Fast path: light MP4 mounts on first client render → play ASAP → short crossfade from poster.
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLive, setVideoLive] = useState(false);
  const upgradedRef = useRef(false);

  const isClient = useIsClient();
  const preferStatic = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const showVideo = isClient && !preferStatic && !videoFailed;

  // Autoplay + reveal as soon as the first frames are ready.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !showVideo) return;

    let cancelled = false;
    let live = false;

    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    el.playsInline = true;
    el.autoplay = true;
    el.loop = true;
    el.preload = "auto";
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.setAttribute("autoplay", "");

    const goLive = () => {
      if (cancelled || live) return;
      live = true;
      setVideoLive(true);
    };

    const tryPlay = () => {
      if (cancelled || document.hidden) return;
      const p = el.play();
      if (p !== undefined) {
        p.then(() => {
          if (!cancelled) goLive();
        }).catch(() => {
          // Retry on next canplay / gesture.
        });
      }
    };

    const onReady = () => {
      try {
        if (el.currentTime > 0.05) el.currentTime = 0;
      } catch {
        // ignore
      }
      tryPlay();
      // If we already have data, reveal quickly even if play() is slightly deferred.
      if (el.readyState >= 2) {
        goLive();
        tryPlay();
      }
    };

    const onPlaying = () => goLive();

    const onVisibility = () => {
      if (document.hidden) el.pause();
      else tryPlay();
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (!entry) return;
              if (entry.isIntersecting) tryPlay();
              else if (live) el.pause();
            },
            { threshold: [0, 0.1] },
          )
        : null;
    io?.observe(el);

    el.addEventListener("loadeddata", onReady);
    el.addEventListener("canplay", onReady);
    el.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisibility);

    // Kick immediately — light file should buffer fast on localhost/prod.
    if (el.readyState >= 2) onReady();
    else {
      try {
        el.load();
      } catch {
        // ignore
      }
      tryPlay();
    }

    const t1 = window.setTimeout(tryPlay, 50);
    const t2 = window.setTimeout(tryPlay, 200);

    const unlock = () => tryPlay();
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    window.addEventListener("pointerdown", unlock, { passive: true, once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      io?.disconnect();
    };
  }, [showVideo]);

  // Optional: after the light loop is live, quietly upgrade large desktops to hi-res.
  useEffect(() => {
    if (!videoLive || upgradedRef.current || preferStatic || videoFailed) return;
    if (!wantsHiResUpgrade()) return;

    const el = videoRef.current;
    if (!el) return;

    // Don't interrupt if network is slow — only upgrade after a short idle.
    const timer = window.setTimeout(() => {
      if (upgradedRef.current || document.hidden) return;
      upgradedRef.current = true;
      const t = el.currentTime;
      const wasPaused = el.paused;
      // Swap to hi-res mp4 only (same loop content).
      while (el.firstChild) el.removeChild(el.firstChild);
      const src = document.createElement("source");
      src.src = HERO_VIDEO_HIRES_MP4;
      src.type = "video/mp4";
      el.appendChild(src);
      el.load();
      const resume = () => {
        try {
          el.currentTime = t;
        } catch {
          // ignore
        }
        if (!wasPaused) void el.play().catch(() => {});
        el.removeEventListener("loadeddata", resume);
      };
      el.addEventListener("loadeddata", resume);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [videoLive, preferStatic, videoFailed]);

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      aria-label="FORGE GYM hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO_POSTER}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={82}
            className="object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%]"
            aria-hidden="true"
          />

          {showVideo ? (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%] ${
                videoLive
                  ? "opacity-100 transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  : "opacity-0"
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
                setVideoLive(false);
              }}
            >
              <source src={HERO_VIDEO_MP4} type="video/mp4" />
              <source src={HERO_VIDEO_WEBM} type="video/webm" />
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
