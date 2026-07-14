import { useCallback, useEffect, useRef, useState } from 'react';

export type RouteLoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

type LoadResult = { ok: true } | { ok: false; message: string };

export type UseRouteLoadWithRetryOptions = {
  /** When true on first mount/attempt, skip network and mark ready immediately. */
  initiallyReady?: boolean;
  /**
   * When false, stay in loading and do not call `load` (e.g. wait for parent hydration).
   * Defaults to true.
   */
  enabled?: boolean;
  /**
   * When this value changes, re-run the load (e.g. checkout params key).
   * Does not count as a user retry for the force flag on the first call.
   */
  reloadKey?: string | number;
  /**
   * Attempt a load. Called up to twice per user attempt (initial + one auto-retry),
   * then the error UI is shown until the user taps Try again.
   */
  load: (options: { force: boolean }) => Promise<LoadResult>;
};

/**
 * Shared route bootstrap: loader → auto-retry once on failure → error screen with Try again.
 */
export function useRouteLoadWithRetry({
  initiallyReady = false,
  enabled = true,
  reloadKey = 0,
  load,
}: UseRouteLoadWithRetryOptions): {
  loadState: RouteLoadState;
  retry: () => void;
} {
  const [loadState, setLoadState] = useState<RouteLoadState>(() =>
    initiallyReady ? { status: 'ready' } : { status: 'loading' },
  );
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  const prevReloadKeyRef = useRef(reloadKey);

  useEffect(() => {
    if (!enabled) {
      setLoadState({ status: 'loading' });
      return;
    }

    const reloadKeyChanged = prevReloadKeyRef.current !== reloadKey;
    prevReloadKeyRef.current = reloadKey;

    // Cached data already available — skip network until retry or reloadKey change.
    if (initiallyReady && attempt === 0 && !reloadKeyChanged) {
      setLoadState({ status: 'ready' });
      return;
    }

    let cancelled = false;
    setLoadState({ status: 'loading' });

    void (async () => {
      const force = attempt > 0 || reloadKeyChanged;
      let result = await loadRef.current({ force });

      // Fail once silently, then retry the same call before showing the error UI.
      if (!result.ok) {
        result = await loadRef.current({ force: true });
      }

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setLoadState({
          status: 'error',
          message: result.message.trim() || 'Something went wrong. Please try again.',
        });
        return;
      }

      setLoadState({ status: 'ready' });
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt, enabled, initiallyReady, reloadKey]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return { loadState, retry };
}
