export const SCANNER_MAX_ATTEMPTS = 3;
export const SCANNER_RETRY_BASE_MS = 400;
export const SCANNER_REQUEST_TIMEOUT_MS = 30_000;

export const PARK_POLL_INITIAL_MS = 1000;
export const PARK_POLL_MAX_MS = 8000;
export const PARK_POLL_TIMEOUT_MS = 120_000;

export const EMERGENCY_POLL_INITIAL_MS = 1000;
export const EMERGENCY_POLL_MAX_MS = 8000;
export const EMERGENCY_POLL_TIMEOUT_MS = 180_000;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('Request timed out.'));
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    promise
      .then((value) => {
        window.clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        resolve(value);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        reject(error instanceof Error ? error : new Error('Request failed.'));
      });
  });
}
