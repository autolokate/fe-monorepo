import { ApiError } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';

const UNAVAILABLE_MESSAGE =
  'Partners admin is not available on this environment yet — the /admin/v1/partners and /admin/v1/taxi/requests routes are not deployed here.';
const FORBIDDEN_MESSAGE =
  'Your account is not allowed to view Partners. It needs partners:read (OPERATOR / PARTNER_MANAGER / OPS / SUPPORT / READ_ONLY).';

/** Nest Admin Partners routes answer 404 until the BE that ships them is deployed. */
export function isPartnersApiUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404 && error.code !== 'not_found';
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
