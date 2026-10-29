import { ApiError } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';

const UNAVAILABLE_MESSAGE = 'Partners admin is not available on this environment yet.';
const FORBIDDEN_MESSAGE =
  'Your account is not allowed to view Partners. Ask for partner-read access or an elevated operator session.';

/** Nest Admin Partners routes answer 404 until the BE that ships them is deployed. */
export function isPartnersApiUnavailable(error: unknown): boolean {
  // Live Nest returns HTTP 404 + code `not_found` for undeployed routes.
  return error instanceof ApiError && error.status === 404;
}

function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/** User-safe message for a Partners READ failure — names the environment gap instead of a generic error. */
export function describePartnersReadError(error: unknown): string {
  if (isPartnersApiUnavailable(error)) {
    return UNAVAILABLE_MESSAGE;
  }
  if (isForbidden(error)) {
    return FORBIDDEN_MESSAGE;
  }
  return mapAdminApiError(error).userMessage;
}
