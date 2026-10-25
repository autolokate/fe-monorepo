import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';
import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_PARTNER_ORG_ID,
  installHermeticPartnersRoutes,
  openPartnerDetailPage,
  openPartnersDirectoryPage,
} from './helpers/hermetic-partners';

const skipReason =
  unsupportedSpecSkipReason('partners-directory.hermetic.spec.ts') ??
  'GET /admin/v1/partners* absent from live Dev OA — hermetic mock ≠ Live Supported';

/**
 * Hermetic only. Skipped ≠ passed — re-enable when Nest ships Admin Partners on Dev OA.
 */
test.describe.skip(`Admin Partners directory (hermetic) — ${skipReason}`, () => {
  test('directory filters + opens partner detail with reel inventory', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const partners = await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnersDirectoryPage(page);

    await expect(page.getByText('Hermetic Garage Partner')).toBeVisible();
    await page.getByTestId('filter-chip-TAXI').click();
    await expect(page.getByText('No taxi partners yet')).toBeVisible();
    await page.getByTestId('filter-chip-GARAGE').click();
    await page.getByText('Hermetic Garage Partner').click();
    await expect(page).toHaveURL(new RegExp(`/partners/${HERMETIC_PARTNER_ORG_ID}$`));
    await expect(page.getByTestId('partners-detail-summary')).toBeVisible();
    await expect(page.getByTestId('partners-reels-section')).toContainText('Hermetic AutoClip');
    expect(partners.partnersList.length).toBeGreaterThan(0);
    expect(partners.partnerDetail).toContain(HERMETIC_PARTNER_ORG_ID);
    expect(base.unexpected).toEqual([]);
    expect(partners.unexpected).toEqual([]);
  });

  test('detail deep-link loads org summary from GET /admin/v1/partners/{orgId}', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const partners = await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnerDetailPage(page);

    await expect(page.getByRole('heading', { name: 'Hermetic Garage Partner' })).toBeVisible();
    await expect(page.getByText('Server fields only')).toBeVisible();
    expect(partners.partnerDetail).toContain(HERMETIC_PARTNER_ORG_ID);
  });
});
