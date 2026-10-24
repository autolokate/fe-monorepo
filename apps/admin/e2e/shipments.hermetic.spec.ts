import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';

/**
 * Product-blocked: POST /admin/v1/shipments/{orderId}/status (absent from Nest OA).
 * GET list coverage lives in shipments-list.hermetic.spec.ts (enabled).
 * Skipped ≠ passed.
 */
const skipReason =
  unsupportedSpecSkipReason('shipments.hermetic.spec.ts') ??
  'POST …/shipments/…/status product-blocked';

test.describe.skip(`Shipment mark status (hermetic) — ${skipReason}`, () => {
  test('placeholder — status mutate remains product-blocked', () => {
    expect(true).toBe(true);
  });
});
