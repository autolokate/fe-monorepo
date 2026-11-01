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
    // Confirm step: nothing is published until the operator confirms the diff.
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(capture.taxiPolicyPublish).toBe(0);
    await page.getByTestId('taxi-policy-publish-confirm').click();
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

  test('ADM-04 — every policy field round-trips on save (no silent nulling)', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      seedPublishedTaxiPolicy: true,
    });
    await seedHermeticSession(page);
    await openTaxiPolicyPage(page);

    await expect(page.getByTestId('taxi-deposit-release-hours')).toHaveValue('48');
    await page.getByTestId('taxi-no-show-wait-minutes').fill('20');
    await page.getByTestId('taxi-dispute-sla-days').fill('7');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByTestId('taxi-policy-save-ok')).toBeVisible({ timeout: 10_000 });

    expect(capture.taxiPolicyPut).toHaveLength(1);
    expect(capture.taxiPolicyPut[0]?.body).toEqual({
      customerAdvanceBps: 500,
      partnerDepositBps: 700,
      customerNoShowWaitMinutes: 20,
      customerNoShowMinContactAttempts: 2,
      depositReleaseHoursAfterComplete: 48,
      disputeSlaBusinessDays: 7,
      partnerCancelPenaltyBpsByStage: { gt24h: 2500, h2to24: 5000, lt2hOrNoShow: 10000 },
      notes: null,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('ADM-05 — live and draft side by side; publish confirm shows the diff', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      seedPublishedTaxiPolicy: true,
    });
    await seedHermeticSession(page);
    await openTaxiPolicyPage(page);

    // Live comes from history while a DRAFT exists.
    await expect(page.getByTestId('taxi-policy-published-advance')).toContainText('400 bps');
    await expect(page.getByTestId('taxi-policy-status')).toContainText('DRAFT');
    await expect(page.getByTestId('taxi-customer-advance-bps')).toHaveValue('500');

    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const diff = page.getByTestId('taxi-policy-diff');
    await expect(diff).toContainText('Customer advance');
    await expect(diff).toContainText('400 bps');
    await expect(diff).toContainText('500 bps');
    await expect(diff).not.toContainText('Partner deposit');
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(capture.taxiPolicyPublish).toBe(0);
  });

  test('ADM-05 — 0 bps and partial penalty ladder are rejected client-side', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openTaxiPolicyPage(page);

    await page.getByTestId('taxi-customer-advance-bps').fill('0');
    await page.getByTestId('taxi-penalty-gt24h').fill('2500');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByText('Customer advance must be between 1 and 10000.')).toBeVisible();
    await expect(page.getByText('Fill all three cancel-penalty stages')).toBeVisible();
    expect(capture.taxiPolicyPut).toEqual([]);
  });
});
