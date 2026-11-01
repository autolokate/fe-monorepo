import { ApiError as TransportError } from '@autolokate/api-client';

/**
 * Normalised API error thrown by every website service.
 * Always carries a user-friendly `message`, the HTTP `status` (0 = network/timeout),
 * and the backend error `code` from the `{ error: { code, message } }` envelope.
 */
export class ApiError extends Error {
  status: number;
  code: string | null;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown, code: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

/** Validation failures put per-field errors in `details.fields[]`. */
function firstFieldMessage(details: unknown): string | undefined {
  if (typeof details !== 'object' || details === null) return undefined;
  const inner = (details as { details?: { fields?: { message?: unknown }[] } }).details;
  const first = inner?.fields?.[0]?.message;
  return typeof first === 'string' && first.trim() ? first : undefined;
}

function isAbort(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    ((err as { name?: unknown }).name === 'AbortError' ||
      (err as { name?: unknown }).name === 'TimeoutError')
  );
}

/**
 * Convert any thrown value into an `ApiError`.
 * Use this in catch blocks before surfacing to UI/toast.
 */
export function toApiError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof TransportError) {
    const generic = /^Request failed with status \d+$/.test(err.message);
    const message = generic ? (firstFieldMessage(err.details) ?? fallback) : err.message;
    return new ApiError(message || fallback, err.status, err.details, err.code);
  }

  if (isAbort(err)) return new ApiError('The request timed out. Please try again.', 0);
  // `fetch` rejects with a TypeError when the network is unreachable / CORS fails.
  if (err instanceof TypeError) {
    return new ApiError('Network error — check your connection and try again.', 0);
  }
  if (err instanceof Error) return new ApiError(err.message || fallback, 0);
  return new ApiError(fallback, 0);
}

/** Plain-text message extraction, safe to drop into toasts. */
export function extractApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  return toApiError(err, fallback).message;
}
