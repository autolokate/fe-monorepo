import { expect, test } from '@playwright/test';

import {
  HERMETIC_SERVICE_PROVIDER_ID,
  installHermeticApiRoutes,
  openServicesCataloguePage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin Services catalogue — stubbed Nest catalogue + admin upsert/deactivate.
 * Does NOT prove Live OPERATOR / CONSUMER role on /v1/services/*.
 */
test.describe('Services catalogue (hermetic)', () => {
  test('list + upsert + deactivate wiring', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openServicesCataloguePage(page);

    await expect(page.getByTestId('services-hub-categories')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('services-hub-categories-save')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Hermetic RAS Partner' })).toBeVisible({
      timeout: 10_000,
    });
    expect(capture.servicesCategoriesGet).toBeGreaterThanOrEqual(1);
    expect(capture.servicesProvidersGet.length).toBeGreaterThanOrEqual(1);
    expect(capture.servicesProvidersGet[0]?.path).toBe('/admin/v1/services/providers');

    await page.getByRole('button', { name: 'Add provider' }).click();
    await page.getByTestId('services-upsert-name').fill('Hermetic Hospital Desk');
    await page.getByTestId('services-upsert-category').selectOption('hospitals');
    await page.getByTestId('services-upsert-city').fill('Chennai');
    await page.getByTestId('services-upsert-lat').fill('13.0827');
    await page.getByTestId('services-upsert-lng').fill('80.2707');
    await page.getByTestId('services-upsert-verified').check({ force: true });
    await page.getByTestId('services-upsert-submit').click();

    await expect.poll(() => capture.servicesProvidersPut.length, { timeout: 10_000 }).toBe(1);
    expect(capture.servicesProvidersPut[0]?.path).toBe('/admin/v1/services/providers');
    expect(capture.servicesProvidersPut[0]?.body).toMatchObject({
      name: 'Hermetic Hospital Desk',
      category: 'hospitals',
      city: 'Chennai',
      verifiedPartner: true,
      latitude: 13.0827,
      longitude: 80.2707,
      status: 'ACTIVE',
    });

    await page.getByTestId('filter-chip-hospitals').click();
    await expect(page.getByRole('cell', { name: 'Hermetic Hospital Desk' })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId('filter-chip-ras').click();
    await expect(page.getByRole('cell', { name: 'Hermetic RAS Partner' })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId(`services-deactivate-${HERMETIC_SERVICE_PROVIDER_ID}`).click();
    const confirm = page.getByRole('dialog', { name: 'Deactivate provider?' });
    await expect(confirm).toBeVisible({ timeout: 5_000 });
    await confirm.getByTestId('services-deactivate-reason').fill('Provider closed down');
    await confirm.getByRole('button', { name: 'Deactivate', exact: true }).click();
    await expect.poll(() => capture.servicesProvidersDelete.length, { timeout: 10_000 }).toBe(1);
    expect(capture.servicesProvidersDelete[0]?.path).toBe(
      `/admin/v1/services/providers/${HERMETIC_SERVICE_PROVIDER_ID}`,
    );
    // Optional reason → `SERVICE_PROVIDER_DEACTIVATED` audit row.
    expect(capture.servicesProvidersDelete[0]?.body).toEqual({ reason: 'Provider closed down' });
    await expect(page.getByRole('cell', { name: 'INACTIVE' })).toBeVisible({
      timeout: 10_000,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('edit keeps status and the listing fields the form does not own', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openServicesCataloguePage(page);

    await page.getByTestId('filter-chip-ras').click();
    await page.getByTestId(`services-deactivate-${HERMETIC_SERVICE_PROVIDER_ID}`).click();
    await page.getByRole('button', { name: 'Deactivate', exact: true }).click();
    await expect(page.getByRole('cell', { name: 'INACTIVE' })).toBeVisible({ timeout: 10_000 });
    // No reason typed → no body at all.
    expect(capture.servicesProvidersDelete[0]?.body).toBeNull();

    await page.getByTestId(`services-edit-${HERMETIC_SERVICE_PROVIDER_ID}`).click();
    await expect(page.getByTestId('services-upsert-status')).toHaveValue('INACTIVE');
    await expect(page.getByTestId('services-upsert-services')).toHaveValue('flatTyre');
    await page.getByTestId('services-upsert-city').fill('Mysuru');
    await page.getByTestId('services-upsert-submit').click();

    await expect.poll(() => capture.servicesProvidersPut.length, { timeout: 10_000 }).toBe(1);
    expect(capture.servicesProvidersPut[0]?.body).toMatchObject({
      id: HERMETIC_SERVICE_PROVIDER_ID,
      city: 'Mysuru',
      status: 'INACTIVE',
      services: ['flatTyre'],
      rating: 4.5,
      reviewCount: 12,
      etaMinutes: 25,
      openNow: true,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('providers GET 403 surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      servicesProvidersGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/services-catalogue', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByText('The server refused this action for your operator session.'),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('ADM-08 — hub categories load error disables Save (no defaults-on-error overwrite)', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    let hubPuts = 0;
    await page.route('**/admin/v1/services/hub-categories', async (route) => {
      if (route.request().method() === 'PUT') {
        hubPuts += 1;
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'server_error', message: 'boom' } }),
      });
    });
    await seedHermeticSession(page);
    await openServicesCataloguePage(page);

    await expect(page.getByTestId('services-category-config-error')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('services-hub-categories-save')).toBeDisabled();
    expect(hubPuts).toBe(0);
  });
});
