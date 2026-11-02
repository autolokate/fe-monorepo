import { expect, test } from '@playwright/test';

import {
  HERMETIC_ORDER_ID,
  HERMETIC_ORDER_LABEL,
  installHermeticApiRoutes,
  openOrdersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin orders GET list (Nest OA Present — CL-BE-10 / CL-FE-3).
 * Refund flow lives in orders-refund.hermetic.spec.ts.
 */
test.describe('Orders list (hermetic)', () => {
  test('list PAID orders — Nest orderKind + refund CTA (no call until confirmed)', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOrdersPage(page);

    await expect(page.getByText(HERMETIC_ORDER_LABEL, { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Partner Attach', { exact: true })).toBeVisible();
    expect(capture.ordersGet).toBeGreaterThanOrEqual(1);

    await expect(page.getByTestId(`order-refund-${HERMETIC_ORDER_ID}`)).toBeVisible();
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
    await expect(
      page.getByText('The server refused this action for your operator session.'),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
