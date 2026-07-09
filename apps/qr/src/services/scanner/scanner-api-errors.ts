import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error.js';

export type ScannerApiErrorCode =
  | 'unauthorized'
  | 'not_found'
  | 'validation'
  | 'not_provisioned'
  | 'not_uploaded'
  | 'vendor_unavailable'
  | 'alert_not_cancellable'
  | 'offline'
  | 'timeout'
  | 'server_error'
  | 'unavailable';

export type ScannerApiError = {
  code: ScannerApiErrorCode;
  message: string;
  apiMessage: string | null;
};

function readErrorCode(error: unknown): string | null {
  if (error instanceof ApiError && error.code) {
    return error.code;
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

function readApiResponseMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    const trimmed = error.message.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function isTransient(normalized: ReturnType<typeof normalizeApiError>): boolean {
  return (
    normalized.code === 'offline' ||
    normalized.code === 'network' ||
    normalized.code === 'timeout' ||
    normalized.status === 502 ||
    normalized.status === 503 ||
    normalized.status === 504
  );
}

export function isScannerTransientError(error: unknown): boolean {
  return isTransient(normalizeApiError(error));
}

/** Map scanner park + emergency API failures for toast and UI branches. */
export function mapScannerApiError(error: unknown): ScannerApiError {
  const normalized = normalizeApiError(error);
  const apiCode = readErrorCode(error) ?? readErrorCode(normalized.details);
  const message = resolveUserFacingMessage(error);
  const apiMessage = readApiResponseMessage(error);

  if (isTransient(normalized)) {
    return {
      code: normalized.code === 'timeout' ? 'timeout' : 'offline',
      message,
      apiMessage,
    };
  }

  if (normalized.status === 401 || apiCode === 'unauthorized') {
    return { code: 'unauthorized', message, apiMessage };
  }

  if (normalized.status === 404 || apiCode === 'not_found') {
    return { code: 'not_found', message, apiMessage };
  }

  if (apiCode === 'not_provisioned') {
    return { code: 'not_provisioned', message, apiMessage };
  }

  if (apiCode === 'not_uploaded') {
    return { code: 'not_uploaded', message, apiMessage };
  }

  if (apiCode === 'vendor_unavailable' || normalized.status === 503) {
    return { code: 'vendor_unavailable', message, apiMessage };
  }

  if (apiCode === 'alert_not_cancellable' || normalized.status === 409) {
    return { code: 'alert_not_cancellable', message, apiMessage };
  }

  if (normalized.code === 'validation' || normalized.status === 400) {
    return { code: 'validation', message, apiMessage };
  }

  if (normalized.code === 'server_error' || normalized.status === 500) {
    return { code: 'server_error', message, apiMessage };
  }

  return { code: 'unavailable', message, apiMessage };
}
