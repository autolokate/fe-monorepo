import { useEffect } from 'react';

/**
 * Traps the browser / device back gesture on the current URL.
 * Used on terminal completion screens where returning to earlier steps is invalid.
 */
export function usePreventBrowserBack(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const url = window.location.href;
    window.history.pushState({ qrBackTrap: true }, '', url);

    const onPopState = () => {
      window.history.pushState({ qrBackTrap: true }, '', url);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [enabled]);
}
