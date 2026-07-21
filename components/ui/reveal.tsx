"use client";

import type { ReactNode } from "react";

/**
 * Pass-through wrapper.
 * Scroll-linked reveal animations were removed — they hurt trackpad scroll FPS.
 */
export default function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
}) {
  return <div className={className}>{children}</div>;
}
