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

/**
 * The message to show beside a form's submit button.
 *
 * On a 400 the server's own text is the authoritative one — it names the invariant that was broken
 * ("default plan tier must be on the Sku's offered tiers", "features must not be empty") and is written
 * to be read by an admin. The generic `userMessage` would throw that away, so prefer the server's.
 */
export function resolveSubmitErrorMessage(error: unknown): string {
  const mapped = mapAdminApiError(error);
  if (mapped.code === 'validation' && mapped.message.trim().length > 0) {
    return mapped.message;
  }
  return mapped.userMessage;
}
