import { expect, test } from '@playwright/test';

import {
  HERMETIC_PAYMENT_REF,
  installHermeticApiRoutes,
  seedHermeticSession,
} from './helpers/hermetic';

/** Coverage and Payments rows open the backend detail reads instead of doing nothing. */
test.describe('Coverage + payment detail (hermetic)', () => {
  test('coverage row opens GET /admin/v1/subscriptions/{id}', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await page.goto('/subscriptions');
    await page.locator('tbody tr').first().click({ timeout: 30_000 });
    const detail = page.getByTestId('subscription-detail');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('Auto-renew off');
    await expect(detail).toContainText('Consumer Self');
    expect(capture.unexpected).toEqual([]);
  });

  test('payment row opens GET /admin/v1/payments/{id}', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await page.goto('/payments');
    await page.locator('tbody tr').first().click({ timeout: 30_000 });
    const detail = page.getByTestId('payment-detail');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('₹199');
    await expect(detail).toContainText('Captured');
    await expect(detail).toContainText(HERMETIC_PAYMENT_REF);
    expect(capture.unexpected).toEqual([]);
  });
});
