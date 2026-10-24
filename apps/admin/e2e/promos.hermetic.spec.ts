import { expect, test } from '@playwright/test';

import {
  HERMETIC_PROMO_CODE,
  installHermeticApiRoutes,
  openPromosPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin promo list + create wiring.
 * Does NOT prove Live OPERATOR / step_up / checkout redemption.
 */
test.describe('Promo create (hermetic)', () => {
  test('create promo — POST body + toast + detail sheet', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openPromosPage(page);

    expect(capture.promosGet).toBeGreaterThanOrEqual(1);

    await page.getByRole('button', { name: 'Create promo' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create promo' });
    await expect(dialog).toBeVisible();

    await dialog.getByTestId('promo-create-code').fill(HERMETIC_PROMO_CODE);
    await dialog.getByTestId('promo-create-discount-percent').fill('10');
    await dialog.getByTestId('promo-create-submit').click();

    await expect(page.getByRole('status')).toContainText(`Promo ${HERMETIC_PROMO_CODE} created.`, {
      timeout: 10_000,
    });
    await expect(dialog).toBeHidden();
    // onCreated opens detail sheet titled with the promo code.
    await expect(page.getByRole('dialog', { name: HERMETIC_PROMO_CODE })).toBeVisible({
      timeout: 10_000,
    });

    expect(capture.promosCreate).toHaveLength(1);
    expect(capture.promosCreate[0]?.method).toBe('POST');
    expect(capture.promosCreate[0]?.path).toBe('/admin/v1/promos');
    expect(capture.promosCreate[0]?.body).toMatchObject({
      code: HERMETIC_PROMO_CODE,
      discountPercent: 10,
      active: true,
    });
    expect(capture.promosCreate[0]?.body).toEqual(
      expect.objectContaining({
        validFrom: expect.any(String),
        validTo: expect.any(String),
      }),
    );
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      promosCreateStatus: 403,
    });
    await seedHermeticSession(page);
    await openPromosPage(page);

    await page.getByRole('button', { name: 'Create promo' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create promo' });
    await dialog.getByTestId('promo-create-code').fill(HERMETIC_PROMO_CODE);
    await dialog.getByTestId('promo-create-discount-percent').fill('10');
    await dialog.getByTestId('promo-create-submit').click();

    await expect(dialog.locator('.admin-form-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    expect(capture.promosCreate).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides Create promo CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openPromosPage(page);

    await expect(page.getByRole('heading', { name: 'Promos', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: 'Create promo' })).toHaveCount(0);
    expect(capture.promosCreate).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on list surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      promosGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/promos', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
