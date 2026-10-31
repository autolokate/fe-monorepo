import { expect, test } from '@playwright/test';

import {
  installHermeticApiRoutes,
  openTaxiPolicyPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin Taxi policy — stubbed Nest /admin/v1/taxi/policy* only.
 * Does NOT prove Live OPERATOR / step_up / migrate.
 */
test.describe('Taxi policy (hermetic)', () => {
  test('load + save draft — GET/PUT wiring + success note', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openTaxiPolicyPage(page);

    await expect(page.getByTestId('taxi-customer-advance-bps')).toHaveValue('500');
    await expect(page.getByTestId('taxi-partner-deposit-bps')).toHaveValue('700');
    await expect(page.getByTestId('taxi-policy-status')).toContainText('DRAFT');
    expect(capture.taxiPolicyGet).toBeGreaterThanOrEqual(1);

    await page.getByTestId('taxi-customer-advance-bps').fill('750');
    await page.getByRole('button', { name: 'Save draft' }).click();

    await expect(page.getByRole('status')).toContainText('Draft saved.', {
      timeout: 10_000,
    });
    expect(capture.taxiPolicyPut).toHaveLength(1);
    expect(capture.taxiPolicyPut[0]?.path).toBe('/admin/v1/taxi/policy');
    expect(capture.taxiPolicyPut[0]?.method).toBe('PUT');
    expect(capture.taxiPolicyPut[0]?.body).toMatchObject({
      customerAdvanceBps: 750,
      partnerDepositBps: 700,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('publish draft — POST publish + status PUBLISHED', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openTaxiPolicyPage(page);

    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Policy published.', {
      timeout: 10_000,
    });
    await expect(page.getByTestId('taxi-policy-status')).toContainText('PUBLISHED');
    await expect(page.getByTestId('taxi-policy-published')).toBeVisible();
    await expect(page.getByTestId('taxi-policy-published-advance')).toContainText('500 bps');
    await expect(page.getByTestId('taxi-policy-published-deposit')).toContainText('700 bps');
    expect(capture.taxiPolicyPublish).toBe(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('503 unavailable — empty draft form still usable', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      taxiPolicyGetStatus: 503,
    });
    await seedHermeticSession(page);
    await openTaxiPolicyPage(page);

    await expect(page.getByTestId('taxi-policy-status')).toContainText('None');
    await page.getByTestId('taxi-customer-advance-bps').fill('500');
    await page.getByTestId('taxi-partner-deposit-bps').fill('700');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByRole('status')).toContainText('Draft saved.', {
      timeout: 10_000,
    });
    expect(capture.taxiPolicyPut).toHaveLength(1);
    expect(capture.taxiPolicyPut[0]?.body).toMatchObject({
      customerAdvanceBps: 500,
      partnerDepositBps: 700,
    });
    expect(capture.unexpected).toEqual([]);
  });
});
