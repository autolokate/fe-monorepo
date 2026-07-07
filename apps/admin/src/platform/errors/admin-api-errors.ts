import { normalizeApiError, type NormalizedErrorCode } from '@autolokate/api-client';

export type AdminApiError = {
  code: NormalizedErrorCode;
  message: string;
  userMessage: string;
  requestId: string | null;
};

const USER_MESSAGES: Record<NormalizedErrorCode, string> = {
  validation: 'Some inputs are invalid. Review the form and try again.',
  unauthorized: 'Your session expired. Sign in again to continue.',
  expired: 'Your session expired. Sign in again to continue.',
  offline: 'You appear to be offline. Check your connection and retry.',
  timeout: 'The request timed out. Try again.',
  network: 'Unable to reach Autolokate. Check your connection and retry.',
  rate_limit: 'Too many requests. Wait a moment and try again.',
  server_error: 'Autolokate is temporarily unavailable. Try again shortly.',
  unknown: 'Something went wrong. Try again.',
};

/** Map any admin API failure into a stable, user-safe message. */
export function mapAdminApiError(error: unknown): AdminApiError {
  const normalized = normalizeApiError(error);
  return {
    code: normalized.code,
    message: normalized.message,
    userMessage: USER_MESSAGES[normalized.code],
    requestId: normalized.requestId,
  };
}
