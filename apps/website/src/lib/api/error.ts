import axios, { type AxiosError } from "axios";

/**
 * Normalised API error thrown by the client.
 * Always carries a user-friendly `message` plus the original HTTP `status`.
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type BackendErrorShape = {
  message?: string;
  error?: string;
  detail?: string;
  errors?: { message?: string }[];
};

/** Best-effort extraction of a user-readable message from a backend payload. */
function pickMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const p = payload as BackendErrorShape;
  if (p.message?.trim()) return p.message;
  if (p.error?.trim()) return p.error;
  if (p.detail?.trim()) return p.detail;
  if (Array.isArray(p.errors) && p.errors[0]?.message) return p.errors[0].message!;
  return fallback;
}

/**
 * Convert any thrown value into an `ApiError`.
 * Use this in catch blocks before surfacing to UI/toast.
 */
export function toApiError(err: unknown, fallback = "Something went wrong. Please try again."): ApiError {
  if (err instanceof ApiError) return err;

  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<unknown>;
    const status = axErr.response?.status ?? 0;
    const message = pickMessage(axErr.response?.data, axErr.message || fallback);
    return new ApiError(message, status, axErr.response?.data);
  }

  if (err instanceof Error) return new ApiError(err.message || fallback, 0);
  return new ApiError(fallback, 0);
}

/** Plain-text message extraction, safe to drop into toasts. */
export function extractApiErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  return toApiError(err, fallback).message;
}
