import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error.js';

export type EmergencyApiErrorCode =
  | 'unauthorized'
  | 'not_found'
  | 'limit_reached'
  | 'already_exists'
  | 'validation'
  | 'forbidden'
  | 'offline'
  | 'timeout'
  | 'server_error'
  | 'unavailable';

export type EmergencyApiError = {
  code: EmergencyApiErrorCode;
  message: string;
  /** Raw message from an HTTP API response — only this may be shown to users. */
  apiMessage: string | null;
};

export type EmergencyDomainError = EmergencyApiError | { code: 'missing'; message: string };

export function isSubscriptionResolveError(
  error: EmergencyDomainError,
): error is { code: 'missing'; message: string } {
  return error.code === 'missing';
}

/** User-visible copy only when the backend returned a message body. */
export function readEmergencyApiUserMessage(error: EmergencyDomainError): string | null {
  if (isSubscriptionResolveError(error)) {
    return null;
  }
  return error.apiMessage;
}

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

export function isEmergencyTransientError(error: unknown): boolean {
  return isTransient(normalizeApiError(error));
}

function readApiResponseMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    const trimmed = error.message.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

/** Map emergency contact + rider API failures for toast and UI branches. */
export function mapEmergencyApiError(error: unknown): EmergencyApiError {
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

  if (normalized.status === 403 || apiCode === 'forbidden') {
    return { code: 'forbidden', message, apiMessage };
  }

  if (normalized.status === 404 || apiCode === 'not_found') {
    return { code: 'not_found', message, apiMessage };
  }

  if (apiCode === 'limit_reached' || normalized.status === 409) {
    if (apiCode === 'already_exists' || message.toLowerCase().includes('already exists')) {
      return { code: 'already_exists', message, apiMessage };
    }
    return { code: 'limit_reached', message, apiMessage };
  }

  if (apiCode === 'already_exists') {
    return { code: 'already_exists', message, apiMessage };
  }

  if (normalized.code === 'validation' || normalized.status === 400) {
    return { code: 'validation', message, apiMessage };
  }

  if (normalized.code === 'server_error' || normalized.status === 500) {
    return { code: 'server_error', message, apiMessage };
  }

  return { code: 'unavailable', message, apiMessage };
}
