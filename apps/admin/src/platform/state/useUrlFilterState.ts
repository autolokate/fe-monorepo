import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  readUrlFilterValue,
  readUrlFlag,
  writeUrlFilterValue,
  writeUrlFlag,
} from '@/platform/state/url-filter-state';

type SetFilter<T> = (value: T | ((current: T) => T)) => void;

/**
 * Drop-in replacement for `useState<T>(initial)` on a list filter, persisted in the URL query
 * (`?status=DISPUTED`). Uses `replace` so flipping chips does not flood the history stack.
 */
export function useUrlFilterState<T extends string>(
  key: string,
  initial: T,
  allowed?: readonly T[],
): [T, SetFilter<T>] {
  const [params, setParams] = useSearchParams();
  const value = readUrlFilterValue(params, key, initial, allowed);

  const setValue = useCallback<SetFilter<T>>(
    (next) => {
      // Build on the LIVE query string: React Router's functional updater sees the params of the
      // last render, so two chips clicked back-to-back (result, then window) lost the first one.
      const live = new URLSearchParams(window.location.search);
      const resolved =
        typeof next === 'function' ? next(readUrlFilterValue(live, key, initial, allowed)) : next;
      setParams(writeUrlFilterValue(live, key, resolved, initial), { replace: true });
    },
    [allowed, initial, key, setParams],
  );

  return [value, setValue];
}

/** Boolean filter persisted as `?key=1`. */
export function useUrlFlagState(key: string): [boolean, (value: boolean) => void] {
  const [params, setParams] = useSearchParams();
  const value = readUrlFlag(params, key);
  const setValue = useCallback(
    (next: boolean) => {
      setParams(writeUrlFlag(new URLSearchParams(window.location.search), key, next), {
        replace: true,
      });
    },
    [key, setParams],
  );
  return [value, setValue];
}
