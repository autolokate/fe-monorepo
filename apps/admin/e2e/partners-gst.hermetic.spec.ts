import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_PARTNER_GSTIN_MASKED,
  HERMETIC_PARTNER_ORG_ID,
  HERMETIC_TAXI_ONLY_ORG_ID,
  installHermeticPartnersRoutes,
  openPartnerDetailPage,
  openPartnersDirectoryPage,
} from './helpers/hermetic-partners';

/**
 * `GET /admin/v1/partners[/{orgId}]` rows carry the storefront `gstVerification` (null = taxi-only,
 * no storefront) and a masked GSTIN. The GST panel preselects the real status — there is no REJECTED.
 */
test('partner GST panel preselects the stored status and applies a decision', async ({ page }) => {
  await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
  await installHermeticPartnersRoutes(page, { gstVerification: 'PENDING_REVIEW' });
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
  await expect(page.getByTestId('partners-gst-current')).toHaveText('Pending review');
  await expect(page.getByTestId('partners-gst-unknown')).toHaveCount(0);
  await expect(page.getByTestId('partners-gst-gstin')).toContainText(HERMETIC_PARTNER_GSTIN_MASKED);
  const select = panel.locator('select');
  await expect(select).toHaveValue('PENDING_REVIEW');
  await expect(select.locator('option[value="REJECTED"]')).toHaveCount(0);
  await expect(select.locator('option[value=""]')).toHaveCount(0);
  // Re-applying the stored status is a no-op, so Apply waits for a change.
  await expect(page.getByTestId('partners-gst-verification-apply')).toBeDisabled();

  await select.selectOption('VERIFIED');
  await page.getByTestId('partners-gst-verification-apply').click();
  await expect.poll(() => posts.length).toBe(1);
  expect(posts[0]).toEqual({ gstVerification: 'VERIFIED' });
  await expect(page.getByTestId('partners-gst-current')).toHaveText('Verified');
});

test('a taxi-only partner (gstVerification null) has no GST panel', async ({ page }) => {
  await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
  await installHermeticPartnersRoutes(page);
  await seedHermeticSession(page);
  await openPartnerDetailPage(page, HERMETIC_TAXI_ONLY_ORG_ID);

  await expect(page.getByTestId('partners-detail-summary')).toContainText('No storefront');
  await expect(page.getByTestId('partners-gst-verification')).toHaveCount(0);
});

test('partners directory shows each row’s GST badge', async ({ page }) => {
  await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
  await installHermeticPartnersRoutes(page, { gstVerification: 'NEEDS_ATTENTION' });
  await seedHermeticSession(page);
  await openPartnersDirectoryPage(page);

  await expect(page.getByTestId(`partners-gst-badge-${HERMETIC_PARTNER_ORG_ID}`)).toHaveText(
    'Needs attention',
    { timeout: 15_000 },
  );
  // Taxi-only orgs have no storefront, so GST doesn't apply.
  await page.getByTestId('filter-chip-TAXI').click();
  await expect(page.getByTestId(`partners-gst-badge-${HERMETIC_TAXI_ONLY_ORG_ID}`)).toHaveText('—');
});
