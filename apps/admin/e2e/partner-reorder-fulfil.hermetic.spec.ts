import { expect, test } from '@playwright/test';

import {
  HERMETIC_REORDER_ALLOCATED,
  HERMETIC_REORDER_ID,
  HERMETIC_REORDER_LOCATION_ID,
  installHermeticApiRoutes,
  openQrBatchesPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin partner reorder fulfil (`POST /admin/v1/partner-reorders/{id}/fulfil`).
 * Nest OA: empty body; UUID path id; result `ReorderFulfilResultDto`.
 * Does NOT prove Live OPERATOR / step_up / Partner App.
 * There is no Nest Admin list for partner-reorders — UI shows result panel + inventory refresh.
 */
test.describe('Partner reorder fulfil (hermetic)', () => {
  test('fulfil success — POST path + empty body + result panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    const inventoryBefore = capture.inventoryGet;

    await page.getByRole('button', { name: 'Fulfil reorder' }).click();
    const dialog = page.getByRole('dialog', { name: 'Fulfil partner reorder' });
    await expect(dialog).toBeVisible();

    await dialog.getByTestId('partner-reorder-fulfil-id').fill(HERMETIC_REORDER_ID);
    await dialog.getByTestId('partner-reorder-fulfil-review').click();

    const confirm = page.getByRole('alertdialog', { name: 'Fulfil partner reorder' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Fulfil reorder' }).click();

    await expect(page.locator('.admin-toast-host')).toContainText(
      `Reorder fulfilled — ${HERMETIC_REORDER_ALLOCATED.toLocaleString()} codes allocated.`,
      { timeout: 10_000 },
    );
    await expect(dialog).toBeHidden();

    const result = page.getByLabel('Reorder fulfilled');
    await expect(result).toBeVisible({ timeout: 10_000 });
    await expect(result).toContainText(HERMETIC_REORDER_ID);
    await expect(result).toContainText('CONFIRMED');
    await expect(result).toContainText(HERMETIC_REORDER_ALLOCATED.toLocaleString());
    await expect(result).toContainText(HERMETIC_REORDER_LOCATION_ID);

    expect(capture.partnerReorderFulfil).toHaveLength(1);
    expect(capture.partnerReorderFulfil[0]?.method).toBe('POST');
    expect(capture.partnerReorderFulfil[0]?.path).toBe(
      `/admin/v1/partner-reorders/${HERMETIC_REORDER_ID}/fulfil`,
    );
    // Nest OA: no request body — client posts undefined.
    expect(capture.partnerReorderFulfil[0]?.body).toBeNull();
    // Mutation invalidates inventory list (Nest GET /admin/v1/inventory).
    expect(capture.inventoryGet).toBeGreaterThan(inventoryBefore);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      partnerReorderFulfilStatus: 403,
    });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    await page.getByRole('button', { name: 'Fulfil reorder' }).click();
    const dialog = page.getByRole('dialog', { name: 'Fulfil partner reorder' });
    await dialog.getByTestId('partner-reorder-fulfil-id').fill(HERMETIC_REORDER_ID);
    await dialog.getByTestId('partner-reorder-fulfil-review').click();
    const confirm = page.getByRole('alertdialog', { name: 'Fulfil partner reorder' });
    await confirm.getByRole('button', { name: 'Fulfil reorder' }).click();

    await expect(dialog.locator('.admin-form-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    await expect(page.getByLabel('Reorder fulfilled')).toHaveCount(0);
    expect(capture.partnerReorderFulfil).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 404 surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      partnerReorderFulfilStatus: 404,
    });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    await page.getByRole('button', { name: 'Fulfil reorder' }).click();
    const dialog = page.getByRole('dialog', { name: 'Fulfil partner reorder' });
    await dialog.getByTestId('partner-reorder-fulfil-id').fill(HERMETIC_REORDER_ID);
    await dialog.getByTestId('partner-reorder-fulfil-review').click();
    await page
      .getByRole('alertdialog', { name: 'Fulfil partner reorder' })
      .getByRole('button', { name: 'Fulfil reorder' })
      .click();

    await expect(dialog.locator('.admin-form-error')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel('Reorder fulfilled')).toHaveCount(0);
    expect(capture.partnerReorderFulfil).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides Fulfil reorder CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    await expect(page.getByRole('heading', { name: 'Batches', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: 'Fulfil reorder' })).toHaveCount(0);
    expect(capture.partnerReorderFulfil).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });
});
