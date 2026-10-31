import { expect, test } from '@playwright/test';

import type { Locator } from '@playwright/test';

import {
  HERMETIC_PLAN_ID,
  HERMETIC_SKU_CODE,
  installHermeticApiRoutes,
  openCatalogPage,
  seedHermeticSession,
} from './helpers/hermetic';

/** AlCheckbox paints a visual box over the native input — toggle via label click. */
async function checkShelfTier(dialog: Locator, tierLabel: string): Promise<void> {
  const checkbox = dialog.getByRole('checkbox', { name: tierLabel });
  if (await checkbox.isChecked()) {
    return;
  }
  await dialog
    .locator('label')
    .filter({ hasText: new RegExp(`^${tierLabel}$`) })
    .click();
  await expect(checkbox).toBeChecked();
}

async function fillCreateSkuForm(dialog: Locator): Promise<void> {
  await dialog.getByTestId('sku-create-code').fill(HERMETIC_SKU_CODE);
  await checkShelfTier(dialog, 'SHIELD');
  await dialog.getByTestId('sku-create-default-plan').selectOption(HERMETIC_PLAN_ID);
  await dialog.getByTestId('sku-create-list-price').fill('999');
}

/**
 * `/admin/v1/skus*` are on live Dev OA. Hermetics mock HTTP — they do not prove Live
 * OPERATOR/step_up.
 */
test.describe('Catalog SKU create (hermetic)', () => {
  test('create SKU — POST body + toast', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openCatalogPage(page);

    expect(capture.plansGet).toBeGreaterThanOrEqual(1);
    expect(capture.skusGet).toBeGreaterThanOrEqual(1);

    await page.getByRole('tab', { name: 'SKUs' }).click();
    await page.getByRole('button', { name: 'New SKU' }).click();

    const dialog = page.getByRole('dialog', { name: 'New SKU' });
    await expect(dialog).toBeVisible();

    await fillCreateSkuForm(dialog);
    await dialog.getByTestId('sku-create-submit').click();

    await expect(page.getByRole('status')).toContainText(`SKU ${HERMETIC_SKU_CODE} created.`, {
      timeout: 10_000,
    });
    await expect(dialog).toBeHidden();

    expect(capture.skusCreate).toHaveLength(1);
    expect(capture.skusCreate[0]?.method).toBe('POST');
    expect(capture.skusCreate[0]?.path).toBe('/admin/v1/skus');
    expect(capture.skusCreate[0]?.body).toEqual({
      skuCode: HERMETIC_SKU_CODE,
      channel: 'B2C',
      defaultPlanId: HERMETIC_PLAN_ID,
      offeredTiers: ['SHIELD'],
      listPricePaise: 99_900,
      prepaid: false,
      riderDefault: 0,
      active: true,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      skusCreateStatus: 403,
    });
    await seedHermeticSession(page);
    await openCatalogPage(page);

    await page.getByRole('tab', { name: 'SKUs' }).click();
    await page.getByRole('button', { name: 'New SKU' }).click();
    const dialog = page.getByRole('dialog', { name: 'New SKU' });

    await fillCreateSkuForm(dialog);
    await dialog.getByTestId('sku-create-submit').click();

    await expect(dialog.locator('.admin-form-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    expect(capture.skusCreate).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides New SKU CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openCatalogPage(page);

    await page.getByRole('tab', { name: 'SKUs' }).click();
    await expect(page.getByRole('heading', { name: 'Catalog', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: 'New SKU' })).toHaveCount(0);
    expect(capture.skusCreate).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on plans+skus surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      plansGetStatus: 403,
      skusGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
