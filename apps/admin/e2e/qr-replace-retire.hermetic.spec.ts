import { expect, test } from '@playwright/test';

import {
  HERMETIC_QR_BATCH_CODE,
  HERMETIC_QR_CODE,
  HERMETIC_QR_CODE_ID,
  HERMETIC_QR_CODE_REPLACEMENT,
  HERMETIC_SUBSCRIPTION_ID,
  HERMETIC_VEHICLE_ID,
  installHermeticApiRoutes,
  openQrBatchDetailPage,
  openQrBatchesPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin QR replace / retire (Nest OA):
 *   POST /admin/v1/qr/{code}/replace
 *   POST /admin/v1/qr/{code}/retire
 *
 * Empty body; code path param `^[A-Z0-9-]{6,32}$`.
 * Does NOT prove Live OPERATOR / step_up.
 * Auto-detach sweep is a separate Batches/Stock more-action (stubbed; not this suite).
 */
test.describe('QR replace / retire (hermetic)', () => {
  test('replace success — POST path + empty body + result panel + inventory refresh', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      seedProvisionedQrBatch: true,
    });
    await seedHermeticSession(page);
    await openQrBatchDetailPage(page);

    const inventoryBefore = capture.inventoryGet;

    await page.getByTestId('qr-code-action-input').fill(HERMETIC_QR_CODE);
    await page.getByTestId('qr-code-replace').click();

    const confirm = page.getByRole('alertdialog', { name: 'Replace QR code' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Replace code' }).click();

    await expect(page.locator('.admin-toast-host')).toContainText(
      `Replaced ${HERMETIC_QR_CODE} with ${HERMETIC_QR_CODE_REPLACEMENT}.`,
      { timeout: 10_000 },
    );

    const result = page.getByLabel('Replacement issued');
    await expect(result).toBeVisible({ timeout: 10_000 });
    await expect(result).toContainText(HERMETIC_QR_CODE);
    await expect(result).toContainText(HERMETIC_QR_CODE_REPLACEMENT);
    await expect(result).toContainText(HERMETIC_VEHICLE_ID);
    await expect(result).toContainText(HERMETIC_SUBSCRIPTION_ID);

    expect(capture.qrReplace).toHaveLength(1);
    expect(capture.qrReplace[0]?.method).toBe('POST');
    expect(capture.qrReplace[0]?.path).toBe(`/admin/v1/qr/${HERMETIC_QR_CODE}/replace`);
    expect(capture.qrReplace[0]?.body).toBeNull();
    expect(capture.qrRetire).toEqual([]);
    expect(capture.inventoryGet).toBeGreaterThan(inventoryBefore);
    expect(capture.unexpected).toEqual([]);
  });

  test('retire success — POST path + empty body + result panel + inventory refresh', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      seedProvisionedQrBatch: true,
    });
    await seedHermeticSession(page);
    await openQrBatchDetailPage(page);

    const inventoryBefore = capture.inventoryGet;

    await page.getByTestId('qr-code-action-input').fill(HERMETIC_QR_CODE);
    await page.getByTestId('qr-code-retire').click();

    const confirm = page.getByRole('alertdialog', { name: 'Retire QR code' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Retire code' }).click();

    await expect(page.locator('.admin-toast-host')).toContainText(
      `Retired QR code ${HERMETIC_QR_CODE}.`,
      { timeout: 10_000 },
    );

    const result = page.getByLabel('Code retired');
    await expect(result).toBeVisible({ timeout: 10_000 });
    await expect(result).toContainText(HERMETIC_QR_CODE);
    await expect(result).toContainText(HERMETIC_QR_CODE_ID);

    expect(capture.qrRetire).toHaveLength(1);
    expect(capture.qrRetire[0]?.method).toBe('POST');
    expect(capture.qrRetire[0]?.path).toBe(`/admin/v1/qr/${HERMETIC_QR_CODE}/retire`);
    expect(capture.qrRetire[0]?.body).toBeNull();
    expect(capture.qrReplace).toEqual([]);
    expect(capture.inventoryGet).toBeGreaterThan(inventoryBefore);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on replace surfaces inline error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      seedProvisionedQrBatch: true,
      qrReplaceStatus: 403,
    });
    await seedHermeticSession(page);
    await openQrBatchDetailPage(page);

    await page.getByTestId('qr-code-action-input').fill(HERMETIC_QR_CODE);
    await page.getByTestId('qr-code-replace').click();
    await page
      .getByRole('alertdialog', { name: 'Replace QR code' })
      .getByRole('button', { name: 'Replace code' })
      .click();

    await expect(page.getByTestId('qr-code-action-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    await expect(page.getByLabel('Replacement issued')).toHaveCount(0);
    expect(capture.qrReplace).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 409 not_replaceable surfaces inline error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      seedProvisionedQrBatch: true,
      qrReplaceStatus: 409,
    });
    await seedHermeticSession(page);
    await openQrBatchDetailPage(page);

    await page.getByTestId('qr-code-action-input').fill(HERMETIC_QR_CODE);
    await page.getByTestId('qr-code-replace').click();
    await page
      .getByRole('alertdialog', { name: 'Replace QR code' })
      .getByRole('button', { name: 'Replace code' })
      .click();

    await expect(page.getByTestId('qr-code-action-error')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel('Replacement issued')).toHaveCount(0);
    expect(capture.qrReplace).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides Replace/Retire CTAs', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'READ_ONLY',
      seedProvisionedQrBatch: true,
    });
    await seedHermeticSession(page);
    await openQrBatchDetailPage(page);

    await expect(page.getByRole('heading', { name: HERMETIC_QR_BATCH_CODE })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('qr-code-replace')).toHaveCount(0);
    await expect(page.getByTestId('qr-code-retire')).toHaveCount(0);
    await expect(page.getByTestId('qr-code-write-required')).toBeVisible();
    expect(capture.qrReplace).toEqual([]);
    expect(capture.qrRetire).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('validation — invalid code never calls Nest replace', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      seedProvisionedQrBatch: true,
    });
    await seedHermeticSession(page);
    await openQrBatchDetailPage(page);

    await page.getByTestId('qr-code-action-input').fill('bad');
    await page.getByTestId('qr-code-replace').click();

    await expect(page.getByText(/valid QR code/i)).toBeVisible();
    await expect(page.getByRole('alertdialog', { name: 'Replace QR code' })).toHaveCount(0);
    expect(capture.qrReplace).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('auto-detach sweep — POST empty body from Batches more-actions', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    const inventoryBefore = capture.inventoryGet;

    // AdminMoreActions uses <summary>, which is not role=button in the a11y tree.
    await page.locator('summary.admin-more-actions__summary').click();
    await page.getByRole('menuitem', { name: 'Run auto detach sweep' }).click();

    const confirm = page.getByRole('alertdialog', { name: 'Run auto detach sweep' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Run sweep' }).click();

    await expect(page.locator('.admin-toast-host')).toContainText(
      'Sweep complete — 2 detached, 1 skipped (paid).',
      { timeout: 10_000 },
    );

    expect(capture.qrAutoDetachSweep).toHaveLength(1);
    expect(capture.qrAutoDetachSweep[0]?.method).toBe('POST');
    expect(capture.qrAutoDetachSweep[0]?.path).toBe('/admin/v1/qr-auto-detach-sweep');
    expect(capture.qrAutoDetachSweep[0]?.body).toBeNull();
    expect(capture.inventoryGet).toBeGreaterThan(inventoryBefore);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides auto-detach more-action', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    await expect(page.getByRole('heading', { name: 'Batches', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('summary.admin-more-actions__summary')).toHaveCount(0);
    expect(capture.qrAutoDetachSweep).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });
});
