import { setThemeMode as applyDesignSystemTheme } from '@autolokate/design-system';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  readThemePreference,
  resolveEffectiveTheme,
  writeThemePreference,
  type ThemePreference,
} from './theme-preference.js';
import {
  msUntilNextThemeChange,
  resolveScheduledTheme,
  type ThemeMode,
} from './resolve-scheduled-theme.js';

export type ThemeContextValue = {
  themeMode: ThemeMode;
  preference: ThemePreference;
  applyTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyDocumentTheme(mode: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', mode);
  applyDesignSystemTheme(mode);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => resolveEffectiveTheme());

  const applyTheme = useCallback((next: ThemeMode) => {
    applyDocumentTheme(next);
    setThemeModeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    writeThemePreference(next);
    setPreference(next);
    applyTheme(next);
  }, [applyTheme, themeMode]);

  useEffect(() => {
    applyDocumentTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (preference !== 'auto') {
      return;
    }

    const sync = () => {
      const next = resolveScheduledTheme();
      setThemeModeState(next);
      applyDocumentTheme(next);
    };

    sync();

    let timerId = 0;
    const schedule = () => {
      timerId = window.setTimeout(() => {
        sync();
        schedule();
      }, msUntilNextThemeChange());
    };

    schedule();

    return () => {
      window.clearTimeout(timerId);
    };
  }, [preference]);

  const value = useMemo(
    () => ({
      themeMode,
      preference,
      applyTheme,
      toggleTheme,
    }),
    [applyTheme, preference, themeMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
