import {
  ApiError,
  isStepUpRequiredError,
  normalizeApiError,
  type NormalizedErrorCode,
} from '@autolokate/api-client';

export type AdminApiError = {
  code: NormalizedErrorCode;
  message: string;
  userMessage: string;
  requestId: string | null;
  status: number | null;
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

const FORBIDDEN_MESSAGE = 'The server refused this action for your operator session.';
const STEP_UP_MESSAGE = 'Admin verification expired. Confirm the step-up code to continue.';
export const NOT_DEPLOYED_MESSAGE = 'Not available on this server yet.';

/**
 * Nest answers an unrouted path with 404 `Cannot METHOD /path` — the backend that serves it is not
 * deployed on this environment. A 404 for a missing *resource* (unknown id) is NOT this.
 */
export function isAdminRouteNotDeployed(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    /^cannot (get|post|put|patch|delete) /i.test(error.message)
  );
}

/**
 * For a collection route (no id in the path) any 404 means the route itself is absent. Callers
 * render this as "not available on this server yet", never as an empty list.
 */
export function isAdminListNotDeployed(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/** Map any admin API failure into a stable, user-safe message. */
export function mapAdminApiError(error: unknown): AdminApiError {
  const normalized = normalizeApiError(error);
  let userMessage = USER_MESSAGES[normalized.code];
  if (isStepUpRequiredError(error)) {
    userMessage = STEP_UP_MESSAGE;
  } else if (normalized.status === 403) {
    userMessage = FORBIDDEN_MESSAGE;
  } else if (isAdminRouteNotDeployed(error)) {
    userMessage = NOT_DEPLOYED_MESSAGE;
  }
  return {
    code: normalized.code,
    message: normalized.message,
    userMessage,
    requestId: normalized.requestId,
    status: normalized.status,
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
