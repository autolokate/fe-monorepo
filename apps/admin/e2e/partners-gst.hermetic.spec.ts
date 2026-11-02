import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_PARTNER_ORG_ID,
  installHermeticPartnersRoutes,
  openPartnerDetailPage,
} from './helpers/hermetic-partners';

/**
 * `GET /admin/v1/partners/{orgId}` (AdminPartnerOrgDetailDto) carries no `gstVerification`, so the
 * GST panel must not pre-select a status an operator could apply over a VERIFIED store by accident.
 */
test('partner GST panel never defaults to a status the server did not return', async ({ page }) => {
  await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
  await installHermeticPartnersRoutes(page);
  const posts: unknown[] = [];
  await page.route(
    `**/admin/v1/garage/orgs/${HERMETIC_PARTNER_ORG_ID}/gst-verification`,
    async (route) => {
      posts.push(route.request().postDataJSON() as unknown);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { storeId: 'aaaaaaaa-0000-4000-8000-000000000002', gstVerification: 'VERIFIED' },
          meta: { requestId: 'r', correlationId: 'c' },
        }),
      });
    },
  );
  await seedHermeticSession(page);
  await openPartnerDetailPage(page);

  const panel = page.getByTestId('partners-gst-verification');
  await expect(panel).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('partners-gst-current')).toHaveText('Current status unknown');
  await expect(page.getByTestId('partners-gst-unknown')).toBeVisible();
  await expect(page.getByTestId('partners-gst-verification-apply')).toBeDisabled();

  await panel.locator('select').selectOption('VERIFIED');
  await page.getByTestId('partners-gst-verification-apply').click();
  await expect.poll(() => posts.length).toBe(1);
  expect(posts[0]).toEqual({ gstVerification: 'VERIFIED' });
  await expect(page.getByTestId('partners-gst-current')).toHaveText('Verified');
});
