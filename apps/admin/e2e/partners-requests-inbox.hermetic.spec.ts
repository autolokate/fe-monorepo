import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_TAXI_REQUEST_ID,
  installHermeticPartnersRoutes,
  openPartnersRequestsPage,
} from './helpers/hermetic-partners';

/**
 * Hermetic only (stubbed HTTP). `GET /admin/v1/partners/requests*` + `GET /admin/v1/taxi/requests*`
 * are listed in NEST_OA_ADMIN_ROUTES (live Dev OA), so this suite runs.
 */
test.describe('Admin Partners requests inbox (hermetic)', () => {
  test('garage + taxi tabs show embedded bids from inbox DTOs', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const partners = await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnersRequestsPage(page);

    await expect(page.getByText('Hermetic garage request')).toBeVisible();
    await page.getByText('Hermetic garage request').click();
    await expect(page.getByTestId('partners-bids-panel')).toContainText('₹1,500');

    await page.getByTestId('filter-chip-taxi').click();
    await expect(page.getByText('Kothrud, Pune')).toBeVisible();
    // Flow v3 structured pickup/drop-off city + state.
    await expect(page.getByTestId(`taxi-request-cities-${HERMETIC_TAXI_REQUEST_ID}`)).toContainText(
      'Pune, Maharashtra',
    );
    await expect(page.getByTestId(`taxi-request-cities-${HERMETIC_TAXI_REQUEST_ID}`)).toContainText(
      'Mumbai, Maharashtra',
    );
    await page.getByText('Kothrud, Pune').click();
    await expect(page.getByTestId('partners-bids-panel')).toContainText('₹420');
    await expect(page.getByText('Pickup city / state')).toBeVisible();
    await expect(page.getByText('Drop-off city / state')).toBeVisible();

    expect(partners.garageRequestsList.length).toBeGreaterThan(0);
    expect(partners.taxiRequestsList.length).toBeGreaterThan(0);
    expect(base.unexpected).toEqual([]);
    expect(partners.unexpected).toEqual([]);
  });
});
