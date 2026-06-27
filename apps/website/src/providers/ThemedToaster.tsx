"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/providers/theme-provider";

/** sonner Toaster wired to the active website theme. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={resolvedTheme}
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border/70 bg-card text-card-foreground shadow-lg",
        },
      }}
    />
  );
}
