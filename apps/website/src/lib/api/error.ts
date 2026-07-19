import axios, { type AxiosError } from 'axios';

/**
 * Normalised API error thrown by the client.
 * Always carries a user-friendly `message` plus the original HTTP `status`.
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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

function extractMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const p = payload as BackendErrorShape;

  const direct = nonBlankString(p.message);
  if (direct) return direct;

  // `error` is an object in the canonical envelope, a string elsewhere: handle both.
  const nested = isRecord(p.error) ? nonBlankString(p.error.message) : nonBlankString(p.error);
  if (nested) return nested;

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

/**
 * Convert any thrown value into an `ApiError`.
 * Use this in catch blocks before surfacing to UI/toast.
 */
export function toApiError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): ApiError {
  if (err instanceof ApiError) return err;

  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status ?? 0;
    const message = pickMessage(axErr.response?.data, axErr.message || fallback);
    return new ApiError(message, status, axErr.response?.data);
  }

  if (err instanceof Error) return new ApiError(err.message || fallback, 0);
  return new ApiError(fallback, 0);
}

/** Plain-text message extraction, safe to drop into toasts. */
export function extractApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  return toApiError(err, fallback).message;
}
