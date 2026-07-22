"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const FixedPortalContext = createContext<string>("forge-fixed-layer");

function subscribeNoop() {
  return () => {};
}

/** Mount target for position:fixed UI that must live outside ScrollSmoother content. */
export function FixedPortalProvider({
  children,
  targetId = "forge-fixed-layer",
}: {
  children: ReactNode;
  targetId?: string;
}) {
  return (
    <FixedPortalContext.Provider value={targetId}>
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
  const targetId = useContext(FixedPortalContext);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const target = useSyncExternalStore(
    subscribeNoop,
    () => document.getElementById(targetId),
    () => null,
  );

  if (!mounted || !target) {
    return <>{children}</>;
  }

  return createPortal(children, target);
}
