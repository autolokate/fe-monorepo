import { expect, test } from '@playwright/test';

import {
  HERMETIC_SHIPMENT_ORDER_ID,
  HERMETIC_SHIPMENT_ORDER_NUMBER,
  installHermeticApiRoutes,
  openShipmentsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin shipments GET list (Nest OA Present — CL-BE-11 / CL-FE-3).
 * Status is Nest `PAID` only. POST …/status remains product-blocked (shipments.hermetic.spec.ts skipped).
 */
test.describe('Shipments list (hermetic)', () => {
  test('list PAID shipment — no Update status CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openShipmentsPage(page);

    await expect(page.getByText(HERMETIC_SHIPMENT_ORDER_NUMBER)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('PAID', { exact: true }).first()).toBeVisible();
    expect(capture.shipmentsGet).toBeGreaterThanOrEqual(1);

    await expect(page.getByTestId(`shipment-update-${HERMETIC_SHIPMENT_ORDER_ID}`)).toHaveCount(0);
    expect(capture.shipmentsStatusPost).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on list surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      shipmentsGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/shipments', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
