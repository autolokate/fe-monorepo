/** True when the current document load was triggered by a browser reload. */
export function isPageReload(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const entry = performance.getEntriesByType('navigation')[0];
  if (entry && 'type' in entry) {
    return (entry as PerformanceNavigationTiming).type === 'reload';
  }

  return false;
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** True only when the browser reload landed directly on `pathname`. */
export function wasReloadEntryPath(pathname: string): boolean {
  if (!isPageReload()) {
    return false;
  }

  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!entry?.name) {
    return false;
  }

  try {
    return normalizePathname(new URL(entry.name).pathname) === normalizePathname(pathname);
  } catch {
    return false;
  }
}
