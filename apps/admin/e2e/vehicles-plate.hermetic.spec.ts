import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { installUsersV4Routes, V4_PLATE, V4_VEHICLE_ID } from './helpers/hermetic-users-v4';

/** Vehicles page — search by registration (plate key), then the vehicle drawer. */
test.describe('Vehicles by registration (hermetic)', () => {
  test('search keeps the plate in the URL and opens the vehicle drawer', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);

    await page.goto('/vehicles');
    await expect(page.getByRole('heading', { name: 'Vehicles' }).first()).toBeVisible({
      timeout: 30_000,
    });
    expect(capture.plateSearch).toEqual([]);

    await page.getByTestId('vehicles-plate-input').fill('ka 01 hm 4242');
    await page.getByTestId('vehicles-plate-submit').click();
    await expect(page).toHaveURL(/plate=ka\+01\+hm\+4242|plate=ka%2001%20hm%204242/);
    await expect.poll(() => capture.plateSearch).toEqual(['ka 01 hm 4242']);

    const row = page.getByText(V4_PLATE, { exact: true }).first();
    await expect(row).toBeVisible();
    await expect(page.getByText('RC verified').first()).toBeVisible();
    await row.click();

    const drawer = page.getByTestId('vehicle-drawer');
    await expect(drawer).toContainText('Hyundai Creta', { timeout: 10_000 });
    await expect(page.getByTestId('vehicle-drawer-invites')).toContainText('Pending');
    expect(capture.vehicleInvites).toContain(V4_VEHICLE_ID);
  });

  test('no match is an honest empty state; reload restores the search', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page);
    await seedHermeticSession(page);
    await page.goto('/vehicles?plate=DL00ZZ0000');
    await expect(page.getByText('No vehicle with that registration')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('route not deployed shows the not-deployed state', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page, { notDeployed: true });
    await seedHermeticSession(page);
    await page.goto(`/vehicles?plate=${V4_PLATE}`);
    await expect(page.getByTestId('admin-not-deployed')).toBeVisible({ timeout: 30_000 });
  });
});
