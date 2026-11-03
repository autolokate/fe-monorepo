import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Free-text filters (ids, city names, dates) are capped so a pasted URL cannot carry a novel. */
export const URL_TEXT_FILTER_MAX = 120;

export function readUrlTextValue(params: URLSearchParams, key: string): string {
  return (params.get(key) ?? '').slice(0, URL_TEXT_FILTER_MAX);
}

export function writeUrlTextValue(
  params: URLSearchParams,
  key: string,
  value: string,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const clipped = value.slice(0, URL_TEXT_FILTER_MAX);
  if (clipped.trim() === '') next.delete(key);
  else next.set(key, clipped);
  return next;
}

/**
 * Like `useUrlFilterState`, but for free text (org UUIDs, city names, `YYYY-MM-DD` dates) that the
 * enum-only validator would reject. The value is URL-encoded by `URLSearchParams`; callers still
 * validate/trim before sending it to the API.
 */
export function useUrlTextState(key: string): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  const value = readUrlTextValue(params, key);
  const setValue = useCallback(
    (next: string) => {
      // Read the live query string: React Router's functional updater sees the params of the last
      // render, so two filters changed back-to-back would otherwise overwrite each other.
      const live = new URLSearchParams(window.location.search);
      setParams(writeUrlTextValue(live, key, next), { replace: true });
    },
    [key, setParams],
  );
  return [value, setValue];
}
