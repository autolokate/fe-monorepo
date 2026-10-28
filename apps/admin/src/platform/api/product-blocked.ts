import { ApiError } from '@autolokate/api-client';

/**
 * G0-4 Admin Absents — Nest live OA does not expose these ops. Callers must fail closed
 * (no network attempt, no fake success). Do not invent Nest aliases.
 */
export const ADMIN_PRODUCT_BLOCKED_MESSAGE = 'This operation is not available yet.';

/** Throw before any HTTP call for a G0-4 Absent. */
export function throwAdminProductBlocked(operation: string): never {
  throw new ApiError(
    `${ADMIN_PRODUCT_BLOCKED_MESSAGE} (${operation})`,
    501,
    'admin_product_blocked',
  );
}
