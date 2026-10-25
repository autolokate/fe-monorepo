import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';
import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  installHermeticPartnersRoutes,
  openPartnersRequestsPage,
} from './helpers/hermetic-partners';

const skipReason =
  unsupportedSpecSkipReason('partners-requests-inbox.hermetic.spec.ts') ??
  'GET /admin/v1/partners/requests + /admin/v1/taxi/requests absent from live Dev OA — hermetic mock ≠ Live Supported';

/**
 * Hermetic only. Skipped ≠ passed — re-enable when Nest ships Admin request inboxes on Dev OA.
 */
test.describe.skip(`Admin Partners requests inbox (hermetic) — ${skipReason}`, () => {
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
    await page.getByText('Kothrud, Pune').click();
    await expect(page.getByTestId('partners-bids-panel')).toContainText('₹420');

    expect(partners.garageRequestsList.length).toBeGreaterThan(0);
    expect(partners.taxiRequestsList.length).toBeGreaterThan(0);
    expect(base.unexpected).toEqual([]);
    expect(partners.unexpected).toEqual([]);
  });
});
