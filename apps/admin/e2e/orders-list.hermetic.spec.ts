import { expect, test } from '@playwright/test';

import {
  HERMETIC_ORDER_ID,
  HERMETIC_ORDER_NUMBER,
  installHermeticApiRoutes,
  openOrdersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin orders GET list (Nest OA Present — CL-BE-10 / CL-FE-3).
 * Refund remains product-blocked — see orders-refund.hermetic.spec.ts (still skipped).
 */
test.describe('Orders list (hermetic)', () => {
  test('list PAID orders — Nest orderKind + no refund CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOrdersPage(page);

    await expect(page.getByText(HERMETIC_ORDER_NUMBER)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('PARTNER_ATTACH', { exact: true })).toBeVisible();
    expect(capture.ordersGet).toBeGreaterThanOrEqual(1);

    await expect(page.getByTestId(`order-refund-${HERMETIC_ORDER_ID}`)).toHaveCount(0);
    expect(capture.ordersRefund).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on list surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ordersGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
