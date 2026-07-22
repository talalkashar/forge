"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * GSAP ScrollSmoother shell.
 * - Native scrollbar, premium catch-up feel
 * - Fixed UI must use #forge-fixed-layer (see FixedPortal)
 * - Disabled when user prefers reduced motion
 * - Conservative smooth values so trackpads stay snappy
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      smootherRef.current?.kill();
      smootherRef.current = null;
      return;
    }

    // Single instance
    const existing = ScrollSmoother.get();
    if (existing) {
      existing.kill();
    }

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.85,
      // Light touch smoothing , full smooth on phones often feels laggy
      smoothTouch: 0.08,
      effects: true,
      // Avoid mobile address-bar resize thrash
      ignoreMobileResize: true,
      normalizeScroll: false,
    });

    smootherRef.current = smoother;

    // After route paint, refresh measurements
    const t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      smoother.scrollTop(0);
    }, 80);

    return () => {
      window.clearTimeout(t);
      smoother.kill();
      smootherRef.current = null;
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
    obs.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    return () => obs.disconnect();
  }, []);

  // Refresh when images/fonts settle
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
