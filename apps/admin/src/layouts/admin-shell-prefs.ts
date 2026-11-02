import type { AdminNavGroupId } from '@/app/routes/admin-paths';

/** Per-browser shell conveniences (never business state). Storage can throw — always guarded. */
const KEY = 'al-admin-shell';

export type AdminShellPrefs = {
  sidebarCollapsed: boolean;
  closedGroups: AdminNavGroupId[];
};

const DEFAULT_PREFS: AdminShellPrefs = { sidebarCollapsed: false, closedGroups: [] };

export function parseAdminShellPrefs(raw: string | null): AdminShellPrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const value = JSON.parse(raw) as Partial<AdminShellPrefs> | null;
    if (!value || typeof value !== 'object') return DEFAULT_PREFS;
    return {
      sidebarCollapsed: value.sidebarCollapsed === true,
      closedGroups: Array.isArray(value.closedGroups)
        ? value.closedGroups.filter((id): id is AdminNavGroupId => typeof id === 'string')
        : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function loadAdminShellPrefs(): AdminShellPrefs {
  try {
    return parseAdminShellPrefs(window.localStorage.getItem(KEY));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveAdminShellPrefs(prefs: AdminShellPrefs): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* private mode / blocked storage — the shell still works, it just won't remember */
  }
}
