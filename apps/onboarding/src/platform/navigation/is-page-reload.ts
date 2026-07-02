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
