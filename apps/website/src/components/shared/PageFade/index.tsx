"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface PageFadeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Disable the entrance animation explicitly (in addition to reduced-motion). */
  disabled?: boolean;
}

/**
 * Lightweight CSS-only page entrance wrapper. Fades and slides the children
 * in on mount. Honours `prefers-reduced-motion` and the optional `disabled`
 * prop so static prints / print stylesheets stay calm.
 */
export function PageFade({
  className,
  children,
  disabled,
  ...rest
}: PageFadeProps) {
  const reduced = useReducedMotion();
  const animate = !disabled && !reduced;

  return (
    <div
      className={cn(
        animate &&
          "animate-in fade-in-0 slide-in-from-bottom-1 duration-500 ease-out",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
