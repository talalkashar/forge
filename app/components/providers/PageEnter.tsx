"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Soft page enter on route change — CSS only (no Framer thrash).
 * Keyed by pathname so each navigation re-triggers a short fade/rise.
 */
export default function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
