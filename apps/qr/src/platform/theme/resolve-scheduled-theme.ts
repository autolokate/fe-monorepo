export type ThemeMode = 'light' | 'dark';

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

/** Day (06:00–17:59 local) → light; night → dark. */
export function resolveScheduledTheme(date = new Date()): ThemeMode {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? 'light' : 'dark';
}

/** Milliseconds until the next 06:00 or 18:00 boundary. */
export function msUntilNextThemeChange(date = new Date()): number {
  const next = new Date(date);
  const hour = date.getHours();

  if (hour >= DAY_START_HOUR && hour < DAY_END_HOUR) {
    next.setHours(DAY_END_HOUR, 0, 0, 0);
  } else if (hour < DAY_START_HOUR) {
    next.setHours(DAY_START_HOUR, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(DAY_START_HOUR, 0, 0, 0);
  }

  return Math.max(1_000, next.getTime() - date.getTime());
}

export function applyScheduledTheme(date = new Date()): ThemeMode {
  const theme = resolveScheduledTheme(date);
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}
