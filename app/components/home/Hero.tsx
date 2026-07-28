"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// Cache-bust video encodes when replaced. Poster path stays clean for next/image.
const HERO_ASSET_V = "20260722d";
const HERO_VIDEO_MP4 = `/videos/hero/forge-hero-berserk.mp4?v=${HERO_ASSET_V}`;
const HERO_VIDEO_WEBM = `/videos/hero/forge-hero-berserk.webm?v=${HERO_ASSET_V}`;
const HERO_VIDEO_MOBILE_MP4 = `/videos/hero/forge-hero-berserk-mobile.mp4?v=${HERO_ASSET_V}`;
const HERO_VIDEO_MOBILE_WEBM = `/videos/hero/forge-hero-berserk-mobile.webm?v=${HERO_ASSET_V}`;
const HERO_POSTER = "/videos/posters/forge-hero-berserk.jpg";

type HeroSources = { mp4: string; webm: string; mode: "mobile" | "desktop" };

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
  return (
    window.matchMedia("(max-width: 1024px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function pickSources(): HeroSources {
  if (isMobileViewport()) {
    return {
      mp4: HERO_VIDEO_MOBILE_MP4,
      webm: HERO_VIDEO_MOBILE_WEBM,
      mode: "mobile",
    };
  }
  return {
    mp4: HERO_VIDEO_MP4,
    webm: HERO_VIDEO_WEBM,
    mode: "desktop",
  };
}

/**
 * Full-viewport cinematic hero.
 * - Poster = instant first paint (LCP)
 * - Correct encode mounts once (no mobile→desktop remount hitch on desktop)
 * - Video stays under the poster until frame 0 is actually playing, then a short crossfade
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLive, setVideoLive] = useState(false);
  /** null until layout effect — avoids SSR/client source mismatch remounts */
  const [sources, setSources] = useState<HeroSources | null>(null);

  const preferStatic = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // Before paint: pick the right file once so desktop never loads mobile then swaps.
  useLayoutEffect(() => {
    if (preferStatic) return;
    setSources(pickSources());
  }, [preferStatic]);

  // Warm cache as soon as we know the path.
  useLayoutEffect(() => {
    if (!sources || preferStatic || videoFailed) return;
    const id = "forge-hero-video-preload";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "preload";
      link.as = "video";
      link.type = "video/mp4";
      document.head.appendChild(link);
    }
    if (link.href !== new URL(sources.mp4, window.location.origin).href) {
      link.href = sources.mp4;
    }
  }, [sources, preferStatic, videoFailed]);

  // Drive autoplay + seamless reveal.
  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el || !sources || preferStatic || videoFailed) return;

    let cancelled = false;
    let revealed = false;

    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    el.playsInline = true;
    el.autoplay = true;
    el.loop = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.setAttribute("autoplay", "");

    const markLive = () => {
      if (cancelled || revealed) return;
      // Only show video once we're actually at the start of the loop.
      if (el.currentTime > 0.25) {
        try {
          el.currentTime = 0;
        } catch {
          // keep going
        }
      }
      const paint = () => {
        if (cancelled || revealed) return;
        revealed = true;
        setVideoLive(true);
      };
      const v = el as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };
      if (typeof v.requestVideoFrameCallback === "function") {
        v.requestVideoFrameCallback(() => paint());
      } else {
        requestAnimationFrame(() => requestAnimationFrame(paint));
      }
    };

    const tryPlay = () => {
      if (cancelled || document.hidden) return;
      const p = el.play();
      if (p !== undefined) {
        p.then(() => markLive()).catch(() => {
          // Will retry on canplay / gesture.
        });
      }
    };

    const onMeta = () => {
      try {
        if (el.currentTime !== 0) el.currentTime = 0;
      } catch {
        // ignore
      }
      tryPlay();
    };

    const onPlaying = () => markLive();

    const onVisibility = () => {
      if (document.hidden) {
        el.pause();
      } else {
        tryPlay();
      }
    };

    // Only pause when hero leaves view after it has already started (avoid IO fighting first paint).
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (!entry || !revealed) return;
              if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
                tryPlay();
              } else if (!entry.isIntersecting) {
                el.pause();
              }
            },
            { threshold: [0, 0.12, 0.5] },
          )
        : null;
    io?.observe(el);

    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisibility);

    // Immediate kicks — desktop local should hit canplay almost instantly.
    if (el.readyState >= 2) {
      onMeta();
    } else {
      try {
        el.load();
      } catch {
        // ignore
      }
      tryPlay();
    }

    const t1 = window.setTimeout(tryPlay, 120);
    const t2 = window.setTimeout(tryPlay, 400);

    const unlock = () => tryPlay();
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    window.addEventListener("pointerdown", unlock, { passive: true, once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      io?.disconnect();
    };
  }, [sources, preferStatic, videoFailed]);

  const showVideo = Boolean(sources) && !preferStatic && !videoFailed;

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      aria-label="FORGE GYM hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {/* Always-visible base — matches product framing so the handoff feels intentional */}
          <Image
            src={HERO_POSTER}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={88}
            className="object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%]"
            aria-hidden="true"
          />

          {showVideo && sources ? (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover object-[center_36%] sm:object-[center_40%] lg:object-[center_42%] ${
                videoLive
                  ? "opacity-100 transition-opacity duration-500 ease-out"
                  : "opacity-0"
              }`}
              // No poster attr — we own the poster Image under the video to avoid double flash.
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
              <source src={sources.mp4} type="video/mp4" />
              <source src={sources.webm} type="video/webm" />
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
