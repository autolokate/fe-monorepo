import { expect, test } from '@playwright/test';

import {
  HERMETIC_QR_BATCH_CODE,
  HERMETIC_QR_BATCH_ID,
  HERMETIC_SKU_CODE,
  HERMETIC_SKU_ID,
  installHermeticApiRoutes,
  openQrBatchesPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin QR manufacturing spine (Nest OA only):
 * create DRAFT → generate CODES_GENERATED → provision PROVISIONED → distribute IN_DISTRIBUTION (B2C).
 *
 * Codes list GET is Nest Present (CL-BE-14). CSV export stays product-blocked.
 * Does NOT prove Live OPERATOR / step_up.
 */
test.describe('QR batches lifecycle (hermetic)', () => {
  test('create → generate → provision — Nest paths + status badges', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    expect(capture.inventoryGet).toBeGreaterThanOrEqual(1);

    await page.getByRole('button', { name: 'Create batch' }).click();
    const createDialog = page.getByRole('dialog', { name: 'Create batch' });
    await expect(createDialog).toBeVisible();

    await createDialog.locator('select[name="channel"]').selectOption('B2C');
    await expect(createDialog.locator('select[name="skuId"]')).toBeEnabled({ timeout: 10_000 });
    await createDialog.locator('select[name="skuId"]').selectOption({ label: HERMETIC_SKU_CODE });
    await createDialog.getByLabel('Total count').fill('5');
    await createDialog.getByRole('button', { name: 'Create batch' }).click();

    await expect(page).toHaveURL(new RegExp(`/qr-batches/${HERMETIC_QR_BATCH_ID}$`), {
      timeout: 15_000,
    });
    const toast = page.locator('.admin-toast-host');
    await expect(toast).toContainText(`Batch ${HERMETIC_QR_BATCH_CODE} created.`, {
      timeout: 10_000,
    });

    await expect(page.getByRole('heading', { name: HERMETIC_QR_BATCH_CODE })).toBeVisible({
      timeout: 10_000,
    });
    const batchSummary = page.getByRole('region', { name: 'Overview' });
    await expect(batchSummary).toContainText('Draft');

    expect(capture.qrBatchesCreate).toHaveLength(1);
    expect(capture.qrBatchesCreate[0]?.method).toBe('POST');
    expect(capture.qrBatchesCreate[0]?.path).toBe('/admin/v1/qr-batches');
    expect(capture.qrBatchesCreate[0]?.body).toMatchObject({
      channel: 'B2C',
      skuId: HERMETIC_SKU_ID,
      totalCount: 5,
    });

    await page.getByRole('button', { name: 'Generate codes' }).click();
    const generateConfirm = page.getByRole('alertdialog', { name: 'Generate codes' });
    await expect(generateConfirm).toBeVisible();
    await generateConfirm.getByRole('button', { name: 'Generate codes' }).click();

    await expect(batchSummary).toContainText('Codes Generated', { timeout: 15_000 });
    await expect(toast).toContainText(`Codes generated for ${HERMETIC_QR_BATCH_CODE}.`, {
      timeout: 10_000,
    });
    expect(capture.qrBatchesGenerate).toHaveLength(1);
    expect(capture.qrBatchesGenerate[0]?.path).toBe(
      `/admin/v1/qr-batches/${HERMETIC_QR_BATCH_ID}/generate`,
    );

    await page.getByRole('button', { name: 'Provision batch' }).click();
    const provisionConfirm = page.getByRole('alertdialog', { name: 'Provision batch' });
    await expect(provisionConfirm).toBeVisible();
    await provisionConfirm.getByRole('button', { name: 'Provision batch' }).click();

    await expect(batchSummary).toContainText('Provisioned', { timeout: 15_000 });
    await expect(toast).toContainText(`Batch ${HERMETIC_QR_BATCH_CODE} provisioned.`, {
      timeout: 10_000,
    });
    expect(capture.qrBatchesProvision).toHaveLength(1);
    expect(capture.qrBatchesProvision[0]?.path).toBe(
      `/admin/v1/qr-batches/${HERMETIC_QR_BATCH_ID}/provision`,
    );

    // Print export stays product-blocked.
    await expect(page.getByRole('button', { name: 'Export for print' })).toHaveCount(0);
    await expect(page.getByText('ALK-HERM-CODE-1')).toBeVisible({ timeout: 10_000 });
    expect(capture.qrBatchCodesGet).toBeGreaterThanOrEqual(1);
    expect(capture.qrBatchCodesExportGet).toEqual(0);

    await page.getByRole('button', { name: 'Distribute batch' }).click();
    const distributeConfirm = page.getByRole('alertdialog', { name: 'Distribute batch' });
    await expect(distributeConfirm).toBeVisible();
    await distributeConfirm.getByRole('button', { name: 'Distribute batch' }).click();

    await expect(batchSummary).toContainText('In Distribution', { timeout: 15_000 });
    await expect(toast).toContainText(`Batch ${HERMETIC_QR_BATCH_CODE} released to distribution.`, {
      timeout: 10_000,
    });
    expect(capture.qrBatchesDistribute).toEqual([
      { method: 'POST', path: `/admin/v1/qr-batches/${HERMETIC_QR_BATCH_ID}/distribute` },
    ]);
    await expect(page.getByRole('button', { name: 'Distribute batch' })).toHaveCount(0);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on create surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      qrBatchesCreateStatus: 403,
    });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    await page.getByRole('button', { name: 'Create batch' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create batch' });
    await dialog.locator('select[name="channel"]').selectOption('B2C');
    await expect(dialog.locator('select[name="skuId"]')).toBeEnabled({ timeout: 10_000 });
    await dialog.locator('select[name="skuId"]').selectOption({ label: HERMETIC_SKU_CODE });
    await dialog.getByLabel('Total count').fill('5');
    await dialog.getByRole('button', { name: 'Create batch' }).click();

    await expect(dialog.getByRole('alert')).toHaveText('Something went wrong. Try again.', {
      timeout: 10_000,
    });
    await expect(page).toHaveURL(/\/qr-batches\/?$/);
    expect(capture.qrBatchesCreate).toHaveLength(1);
    expect(capture.qrBatchesGenerate).toEqual([]);
    expect(capture.qrBatchesProvision).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides Create batch CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    await expect(page.getByRole('heading', { name: 'Batches', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: 'Create batch' })).toHaveCount(0);
    expect(capture.qrBatchesCreate).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on inventory list surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      inventoryGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/qr-batches', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
