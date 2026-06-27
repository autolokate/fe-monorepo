"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AlIconButton } from "@autolokate/ui/icon-button";
import { useTheme } from "@/providers/theme-provider";

interface ThemeToggleProps {
  /** Sizing forwarded to the underlying icon button. */
  size?: "sm" | "md" | "lg";
  /** Inline style override (e.g. for white affordances over a dark hero). */
  style?: CSSProperties;
  className?: string;
}

/** Single-button light/dark switch wired to the website ThemeProvider. */
export function ThemeToggle({ size = "md", style, className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  // Avoid a hydration mismatch: the server can't know the persisted theme, so
  // render a stable placeholder icon until mounted on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const nextLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <AlIconButton
      size={size}
      className={className}
      style={style}
      icon={isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      label={nextLabel}
      onClick={toggleTheme}
    />
  );
}
