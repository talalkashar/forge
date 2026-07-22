"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function prefersNativeScroll() {
  if (typeof window === "undefined") return true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Phones + tablets + any coarse pointer: native scroll (ScrollSmoother feels laggy
  // next to a full-viewport hero video). Desktop wide only gets the smoother.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 1024px)").matches;
  return reduced || coarse || narrow;
}

/**
 * GSAP ScrollSmoother shell (desktop only).
 * - Native scrollbar, light catch-up on desktop
 * - Fixed UI must use #forge-fixed-layer (see FixedPortal)
 * - Disabled on touch / narrow viewports and reduced-motion (native scroll)
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const useNative = prefersNativeScroll();

    const existing = ScrollSmoother.get();
    if (existing) {
      existing.kill();
      smootherRef.current = null;
    }

    if (useNative) {
      root.dataset.nativeScroll = "true";
      root.dataset.scrollBehavior = "auto";
      return () => {
        delete root.dataset.nativeScroll;
      };
    }

    root.dataset.nativeScroll = "false";
    root.dataset.scrollBehavior = "smooth";

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.72,
      // Never smooth touch here — mobile uses native path above
      smoothTouch: 0,
      effects: false,
      ignoreMobileResize: true,
      normalizeScroll: false,
    });

    smootherRef.current = smoother;

    const t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      smoother.scrollTop(0);
    }, 80);

    return () => {
      window.clearTimeout(t);
      smoother.kill();
      smootherRef.current = null;
      delete root.dataset.nativeScroll;
    };
  }, [pathname]);

  // Pause smooth scroll while modals lock body scroll
  useEffect(() => {
    const syncPause = () => {
      const smoother = ScrollSmoother.get();
      if (!smoother) return;
      const locked = document.body.style.overflow === "hidden";
      smoother.paused(locked);
    };
    const obs = new MutationObserver(syncPause);
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => obs.disconnect();
  }, []);

  // Refresh when images/fonts settle (desktop smoother only)
  useEffect(() => {
    const onLoad = () => {
      if (ScrollSmoother.get()) ScrollTrigger.refresh();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
