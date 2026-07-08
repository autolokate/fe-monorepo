"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The website renders in a single fixed light theme (the home hero is the only
 * dark surface, scoped locally). There is no light/dark switching, so this
 * provider exists only to keep a stable `useTheme()` contract for the few
 * components that still read the active theme.
 */
export type ResolvedTheme = "light";

interface ThemeContextValue {
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: "light" });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ resolvedTheme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

