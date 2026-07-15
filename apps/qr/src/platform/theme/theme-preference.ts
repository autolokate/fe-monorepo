import { resolveScheduledTheme, type ThemeMode } from './resolve-scheduled-theme';

export type ThemePreference = ThemeMode | 'auto';

export const THEME_PREFERENCE_KEY = 'al-qr-theme';

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_PREFERENCE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
  } catch {
    // private browsing
  }
  return 'auto';
}

export function writeThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_PREFERENCE_KEY, preference);
  } catch {
    // ignore
  }
}

export function resolveEffectiveTheme(
  preference: ThemePreference = readThemePreference(),
  date = new Date(),
): ThemeMode {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }
  return resolveScheduledTheme(date);
}

export function applyEffectiveTheme(preference?: ThemePreference): ThemeMode {
  const theme = resolveEffectiveTheme(preference);
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

/** Flip between light and dark and persist the manual override. */
export function toggleManualTheme(current: ThemeMode): ThemeMode {
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  writeThemePreference(next);
  document.documentElement.setAttribute('data-theme', next);
  return next;
}
