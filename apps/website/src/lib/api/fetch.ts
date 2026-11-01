/** Requests that take longer than this are aborted (parity with the old axios timeout). */
export const REQUEST_TIMEOUT_MS = 30_000;

/** `fetch` with a default timeout; resolved lazily so tests can stub `globalThis.fetch`. */
export const fetchWithTimeout: typeof fetch = (input, init) => {
  const signal =
    init?.signal ??
    (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      : undefined);
  return globalThis.fetch(input, signal ? { ...init, signal } : init);
};
