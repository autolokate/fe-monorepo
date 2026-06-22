"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

/**
 * The app uses a single light theme (black accent on near-white surfaces).
 * The provider / hook API is kept so existing `useTheme()` consumers keep
 * working — `theme` and `resolvedTheme` are always "light" and toggling is
 * a no-op.
 */
export type ThemeChoice = "light";
export type ResolvedTheme = "light";

interface ThemeContextValue {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setTheme: (next: ThemeChoice) => void;
  toggleTheme: () => void;
}

const STATIC_VALUE: ThemeContextValue = {
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(STATIC_VALUE);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }, []);

  return <ThemeContext.Provider value={STATIC_VALUE}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Pre-paint script. Renders synchronously inside <head> so the correct
 * `data-theme` is on <html> before the body paints — no flash.
 */
export const themeBootstrapScript = `
(function () {
  try {
    var d = document.documentElement;
    d.dataset.theme = 'light';
    d.style.colorScheme = 'light';
  } catch (_) {}
})();
`;
