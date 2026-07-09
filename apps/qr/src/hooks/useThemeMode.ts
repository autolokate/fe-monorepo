import {
  useThemeContext,
  type ThemeContextValue,
} from '../platform/theme/ThemeProvider';
import type { ThemeMode } from '../platform/theme/resolve-scheduled-theme';
import type { ThemePreference } from '../platform/theme/theme-preference';

export type { ThemeMode, ThemePreference };

/** Shared theme state — use inside ThemeProvider. */
export function useThemeMode(): ThemeContextValue & {
  syncScheduledTheme: () => void;
} {
  const context = useThemeContext();

  return {
    ...context,
    syncScheduledTheme: () => {
      if (context.preference !== 'auto') {
        return;
      }
      const next = context.themeMode;
      context.applyTheme(next);
    },
  };
}
