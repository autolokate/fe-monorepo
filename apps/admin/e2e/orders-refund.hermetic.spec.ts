import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';

/**
 * Product-blocked: POST /admin/v1/orders/{orderId}/refund (absent from Nest OA).
 * GET list coverage lives in orders-list.hermetic.spec.ts (enabled).
 * Skipped ≠ passed.
 */
const skipReason =
  unsupportedSpecSkipReason('orders-refund.hermetic.spec.ts') ??
  'POST …/refund product-blocked';

test.describe.skip(`Orders refund (hermetic) — ${skipReason}`, () => {
  test('placeholder — refund remains product-blocked', () => {
    expect(true).toBe(true);
  });
});
