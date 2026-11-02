/**
 * Pure helpers behind `useUrlFilterState` — kept React-free so they are unit-testable.
 *
 * List filters live in the URL query string so a filtered view survives reloads, the back button
 * and copy-pasted links (and so the dashboard can deep-link into "disputed bookings" etc.).
 */

/** Enum-shaped filter values the server accepts: `ALL`, `PENDING_REVIEW`, `likes`, `sort_order`… */
const SAFE_FILTER_VALUE = /^[A-Za-z][A-Za-z0-9_]{0,47}$/;

/**
 * Reads one filter from a query string. Unknown / malformed values fall back to `initial` so a
 * hand-edited URL can never send an arbitrary string to the API.
 */
export function readUrlFilterValue<T extends string>(
  params: URLSearchParams,
  key: string,
  initial: T,
  allowed?: readonly T[],
): T {
  const raw = params.get(key);
  if (raw === null || raw === '') return initial;
  if (allowed) return (allowed as readonly string[]).includes(raw) ? (raw as T) : initial;
  return SAFE_FILTER_VALUE.test(raw) ? (raw as T) : initial;
}

/**
 * Returns the next query string after setting one filter. The default value is dropped from the
 * URL so unfiltered pages keep clean links.
 */
export function writeUrlFilterValue(
  params: URLSearchParams,
  key: string,
  value: string,
  initial: string,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (value === initial || value === '') {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  return next;
}

/** Boolean flag variant (`?flagged=1`). */
export function readUrlFlag(params: URLSearchParams, key: string): boolean {
  const raw = params.get(key);
  return raw === '1' || raw === 'true';
}

export function writeUrlFlag(params: URLSearchParams, key: string, on: boolean): URLSearchParams {
  const next = new URLSearchParams(params);
  if (on) next.set(key, '1');
  else next.delete(key);
  return next;
}
