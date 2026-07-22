"use client";

import type { ReactNode } from "react";

/** Lightweight enter , CSS only, no continuous layout thrash from Framer. */
export default function PageEnter({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
