import { expect, test } from '@playwright/test';

import {
  HERMETIC_CLAWBACK_PAYMENT_REF,
  installHermeticApiRoutes,
  openFinancePage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin finance clawback + settlement-batch wiring.
 * Does NOT prove Live OPERATOR / step_up / partner ledger settle.
 */
test.describe('Finance clawback + settlement (hermetic)', () => {
  test('create clawback — POST body + result panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openFinancePage(page);

    await page.getByRole('button', { name: 'Create clawback' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create clawback' });
    await expect(dialog).toBeVisible();

    await dialog.getByTestId('clawback-payment-ref').fill(HERMETIC_CLAWBACK_PAYMENT_REF);
    await dialog.getByTestId('clawback-submit').click();

    await expect(page.getByRole('status')).toContainText(
      `Clawback recorded for ${HERMETIC_CLAWBACK_PAYMENT_REF}`,
      { timeout: 10_000 },
    );
    await expect(page.getByLabel('Clawback result')).toBeVisible();
    await expect(page.getByLabel('Clawback result')).toContainText(HERMETIC_CLAWBACK_PAYMENT_REF);
    await expect(page.getByLabel('Clawback result')).toContainText('CB_LOST');
    await expect(dialog).toBeHidden();

    expect(capture.clawbacksPost).toHaveLength(1);
    expect(capture.clawbacksPost[0]?.method).toBe('POST');
    expect(capture.clawbacksPost[0]?.path).toBe('/admin/v1/clawbacks');
    expect(capture.clawbacksPost[0]?.body).toEqual({
      paymentRef: HERMETIC_CLAWBACK_PAYMENT_REF,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on clawback surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      clawbacksPostStatus: 403,
    });
    await seedHermeticSession(page);
    await openFinancePage(page);

    await page.getByRole('button', { name: 'Create clawback' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create clawback' });
    await dialog.getByTestId('clawback-payment-ref').fill(HERMETIC_CLAWBACK_PAYMENT_REF);
    await dialog.getByTestId('clawback-submit').click();

    await expect(dialog.locator('.admin-form-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    await expect(page.getByLabel('Clawback result')).toHaveCount(0);
    expect(capture.clawbacksPost).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('run settlement — confirm POST + result panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openFinancePage(page);

    await page.getByRole('button', { name: 'Run settlement' }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Run settlement batch' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Run settlement' }).click();

    await expect(page.getByRole('status')).toContainText('Settlement batch complete', {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Settlement batch result')).toBeVisible();
    await expect(page.getByLabel('Settlement batch result')).toContainText('Payouts created');
    await expect(confirm).toBeHidden();

    expect(capture.settlementBatchPost).toBe(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on settlement keeps empty results', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      settlementBatchPostStatus: 403,
    });
    await seedHermeticSession(page);
    await openFinancePage(page);

    await page.getByRole('button', { name: 'Run settlement' }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Run settlement batch' });
    await confirm.getByRole('button', { name: 'Run settlement' }).click();

    await expect(page.getByLabel('Settlement batch result')).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByText(/Results from clawbacks and settlement batches/i)).toBeVisible();
    expect(capture.settlementBatchPost).toBe(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY sees Access denied', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await page.goto('/finance', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Access denied')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Create clawback' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Run settlement' })).toHaveCount(0);
    expect(capture.clawbacksPost).toEqual([]);
    expect(capture.settlementBatchPost).toBe(0);
  });
});
