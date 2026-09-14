import axios, { type AxiosError } from 'axios';

/**
 * Normalised API error thrown by the client.
 * Always carries a user-friendly `message` plus the original HTTP `status`.
 */
export class ApiError extends Error {
  status: number;
  code: string | null;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown, code: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/**
 * Body of the canonical backend error envelope `{ error: { code, message, ... } }`
 * (autolokate-backend docs/architecture/rest-api-standards.md § Error envelope).
 * Validation failures put per-field errors in `details.fields[]`.
 */
type BackendErrorBody = {
  code?: string;
  message?: string;
  details?: { fields?: { path?: string; message?: string }[] };
};

type BackendErrorShape = {
  message?: string;
  /** Object in the canonical envelope; a bare string from legacy/other producers. */
  error?: string | BackendErrorBody;
  detail?: string;
  errors?: { message?: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The value itself when it is a non-blank string, else undefined. */
function nonBlankString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function extractCode(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (isRecord(payload.error) && typeof payload.error.code === 'string') {
    return payload.error.code;
  }
  return typeof payload.code === 'string' ? payload.code : null;
}

function extractMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const p = payload as BackendErrorShape;

  // Prefer the nested envelope message — that is the canonical backend shape.
  const nested = isRecord(p.error) ? nonBlankString(p.error.message) : nonBlankString(p.error);
  if (nested) return nested;

  const direct = nonBlankString(p.message);
  if (direct) return direct;

  const detail = nonBlankString(p.detail);
  if (detail) return detail;

  if (Array.isArray(p.errors)) {
    const first = p.errors[0];
    if (isRecord(first)) return nonBlankString(first.message);
  }
  return undefined;
}

/**
 * Best-effort extraction of a user-readable message from a backend payload.
 * Never throws: a message extractor must not become the error it is reporting.
 */
function pickMessage(payload: unknown, fallback: string): string {
  try {
    return extractMessage(payload) ?? fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_FALLBACK = 'Something went wrong. Please try again.';

/** True for transport / framework noise that must never be shown to buyers. */
function isTechnicalMessage(message: string): boolean {
  const value = message.trim();
  return (
    /^(network error|timeout of \d+ms exceeded|request failed with status code \d+|failed to fetch|load failed|econnrefused|err_network|err_canceled|aborted)/i.test(
      value,
    ) ||
    /^cannot\s+(get|post|put|patch|delete)\s+\//i.test(value) ||
    /^invalid\s+(profile|verify otp|refresh token|update profile)\s+response/i.test(value) ||
    /ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(value)
  );
}

function messageForHttpStatus(status: number, code: string | null, fallback: string): string {
  if (status === 401 || code === 'unauthorized' || code === 'unauthenticated') {
    return 'Your session expired. Please sign in again.';
  }
  if (status === 403 || code === 'forbidden') {
    return 'You don’t have permission to do that.';
  }
  if (status === 404 || code === 'not_found') {
    return 'We couldn’t find that information. Please try again.';
  }
  if (status === 409 || code === 'conflict') {
    return 'That request conflicts with the current state. Please try again.';
  }
  if (status === 422 || code === 'validation') {
    return 'Some of the details look invalid. Please check and try again.';
  }
  if (status === 429 || code === 'rate_limited') {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (status >= 500 || code === 'internal_error') {
    return 'Our servers are having trouble. Please try again.';
  }
  return fallback;
}

function messageForTransport(code: string | undefined, raw: string, fallback: string): string {
  if (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_CANCELED' ||
    /timeout/i.test(raw)
  ) {
    return 'This is taking too long. Please try again.';
  }
  if (
    code === 'ERR_NETWORK' ||
    /network error|failed to fetch|load failed|econnrefused/i.test(raw)
  ) {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  return fallback;
}

function humanizeMessage(
  raw: string,
  status: number,
  code: string | null,
  transportCode: string | undefined,
  fallback: string,
): string {
  if (!raw || isTechnicalMessage(raw)) {
    if (status) return messageForHttpStatus(status, code, fallback);
    return messageForTransport(transportCode, raw, fallback);
  }
  return raw;
}

/**
 * Convert any thrown value into an `ApiError` with a message safe to show in the UI.
 */
export function toApiError(err: unknown, fallback = DEFAULT_FALLBACK): ApiError {
  if (err instanceof ApiError) {
    const code = err.code ?? extractCode(err.data);
    const message = humanizeMessage(err.message || fallback, err.status, code, undefined, fallback);
    return new ApiError(message, err.status, err.data, code);
  }

  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status ?? 0;
    const data = axErr.response?.data;
    const code = extractCode(data);
    const fromBody = pickMessage(data, '');
    const message = humanizeMessage(
      fromBody || axErr.message || '',
      status,
      code,
      axErr.code,
      fallback,
    );
    return new ApiError(message, status, data, code);
  }

  if (err instanceof Error) {
    const message = humanizeMessage(err.message || fallback, 0, null, undefined, fallback);
    return new ApiError(message, 0);
  }
  return new ApiError(fallback, 0);
}

/** Plain-text message extraction, safe to drop into toasts. */
export function extractApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  return toApiError(err, fallback).message;
}
