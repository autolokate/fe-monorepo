import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';

/**
 * Product-blocked: POST/DELETE /admin/v1/users/{userId}/roles* (absent from Nest OA).
 * GET phone lookup lives in users-lookup.hermetic.spec.ts (enabled).
 * Skipped ≠ passed. Do not invent ADMIN↔OPERATOR grant mapping.
 */
const skipReason =
  unsupportedSpecSkipReason('users-roles.hermetic.spec.ts') ??
  'Role grant/revoke product-blocked';

test.describe.skip(`Users roles (hermetic) — ${skipReason}`, () => {
  test('placeholder — role grant/revoke remains product-blocked', () => {
    expect(true).toBe(true);
  });
});
