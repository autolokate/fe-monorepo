import { useCallback, useState } from 'react';
import { setThemeMode } from '@autolokate/design-system';

import {
  applyScheduledTheme,
  resolveScheduledTheme,
  type ThemeMode,
} from '../platform/theme/resolve-scheduled-theme.js';

export type { ThemeMode };

function readThemeMode(): ThemeMode {
  return resolveScheduledTheme();
}

/** Read and apply the time-of-day theme (no persisted preference). */
export function useThemeMode() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readThemeMode);

  const applyTheme = useCallback((next: ThemeMode) => {
    setThemeMode(next);
    document.documentElement.setAttribute('data-theme', next);
    setThemeModeState(next);
  }, []);

  const syncScheduledTheme = useCallback(() => {
    const next = applyScheduledTheme();
    setThemeMode(next);
    setThemeModeState(next);
  }, []);

  return { themeMode, applyTheme, syncScheduledTheme };
}
