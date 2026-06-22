"use client";

import { useEffect, useState } from "react";

/**
 * Reads `prefers-reduced-motion: reduce` and stays in sync with the media query.
 * Returns `false` during SSR / before hydration so animations render normally
 * on first paint when the user has not opted out.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
