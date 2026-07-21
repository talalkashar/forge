"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const FixedPortalContext = createContext<HTMLElement | null>(null);

/** Mount target for position:fixed UI that must live outside ScrollSmoother content. */
export function FixedPortalProvider({
  children,
  targetId = "forge-fixed-layer",
}: {
  children: ReactNode;
  targetId?: string;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(targetId));
  }, [targetId]);

  return (
    <FixedPortalContext.Provider value={target}>
      {children}
    </FixedPortalContext.Provider>
  );
}

/**
 * Renders children into #forge-fixed-layer so fixed UI is not trapped
 * by ScrollSmoother transforms. Falls back to in-tree render until mounted
 * (avoids blank nav flash on SSR/hydration).
 */
export function FixedPortal({ children }: { children: ReactNode }) {
  const target = useContext(FixedPortalContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !target) {
    return <>{children}</>;
  }

  return createPortal(children, target);
}
