/**
 * FORGE motion system — one language for Framer + mental model for CSS.
 * Goal: quick response, soft settle (premium, not sluggish or jittery).
 */

/** Primary ease: accelerates out, gentle finish */
export const forgeEase = [0.22, 1, 0.36, 1] as const;

/** Slightly snappier for micro interactions (taps, toggles) */
export const forgeEaseOut = [0.16, 1, 0.3, 1] as const;

export const forgeDuration = {
  /** Instant feedback — button press, opacity toggle */
  instant: 0.16,
  /** Default UI — borders, hovers, pills */
  fast: 0.28,
  /** Panels, modals, page sections */
  base: 0.4,
  /** Large reveals only */
  slow: 0.55,
} as const;

/** Shared Framer defaults */
export const forgeTransition = {
  duration: forgeDuration.base,
  ease: forgeEase,
} as const;

export const forgeTransitionFast = {
  duration: forgeDuration.fast,
  ease: forgeEaseOut,
} as const;

/** Fade + soft rise for menus / overlays */
export const forgeFadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: forgeTransition,
} as const;

export const forgeFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: forgeDuration.fast, ease: forgeEase },
} as const;
