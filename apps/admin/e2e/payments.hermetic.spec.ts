import { expect, test } from '@playwright/test';

import {
  HERMETIC_ORDER_NUMBER,
  HERMETIC_PAYMENT_REF,
  installHermeticApiRoutes,
  openPaymentsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin payments list (Nest OA Present — CL-BE-13 / CL-FE-3).
 * `providerRef` is always null (redacted) — do not fabricate.
 */
test.describe('Payments list (hermetic)', () => {
  test('list — Nest payment row with redacted providerRef', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openPaymentsPage(page);

    await expect(page.getByText(HERMETIC_ORDER_NUMBER)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(HERMETIC_PAYMENT_REF)).toBeVisible();
    expect(capture.paymentsGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });
});
