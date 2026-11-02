/** Recently visited nav routes for the command palette (per browser, best-effort storage). */
const KEY = 'al-admin-recent-routes';
const MAX = 6;

export function pushRecentRoute(list: readonly string[], path: string, max = MAX): string[] {
  return [path, ...list.filter((entry) => entry !== path)].slice(0, max);
}

export function readRecentAdminRoutes(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch {
    return [];
  }
}

export function recordRecentAdminRoute(path: string): void {
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(pushRecentRoute(readRecentAdminRoutes(), path)),
    );
  } catch {
    /* storage blocked — the palette simply shows no recents */
  }
}
