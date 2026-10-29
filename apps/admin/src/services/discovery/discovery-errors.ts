import { ApiError } from '@autolokate/api-client';

import { mapAdminApiError, resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';

const UNAVAILABLE_MESSAGE = 'Discovery admin is not available on this environment yet.';
const FORBIDDEN_MESSAGE =
  'Your account is not allowed to manage Discovery. Ask for an elevated operator session.';

/** The Nest admin Discovery routes answer 404 until the BE that ships them is deployed. */
export function isDiscoveryApiUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404 && error.code !== 'not_found';
}

function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/** User-safe message for a Discovery READ failure — names the environment gap instead of a generic error. */
export function describeDiscoveryReadError(error: unknown): string {
  if (isDiscoveryApiUnavailable(error)) {
    return UNAVAILABLE_MESSAGE;
  }
  if (isForbidden(error)) {
    return FORBIDDEN_MESSAGE;
  }
  return mapAdminApiError(error).userMessage;
}

/** Message beside a Discovery form's submit button. */
export function describeDiscoverySubmitError(error: unknown): string {
  if (isDiscoveryApiUnavailable(error)) {
    return UNAVAILABLE_MESSAGE;
  }
  if (isForbidden(error)) {
    return FORBIDDEN_MESSAGE;
  }
  return resolveSubmitErrorMessage(error);
}
