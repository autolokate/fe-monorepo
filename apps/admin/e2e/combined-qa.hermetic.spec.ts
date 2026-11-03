import { expect, test } from '@playwright/test';

import {
  HERMETIC_OWNERSHIP_CLAIM_ID,
  installHermeticApiRoutes,
  openOwnershipClaimsPage,
  seedHermeticSession,
} from './helpers/hermetic';
import {
  HERMETIC_PARTNER_ORG_ID,
  installHermeticPartnersRoutes,
  openPartnerDetailPage,
  openPartnersRequestsPage,
} from './helpers/hermetic-partners';
import { installUsersV4Routes, V4_SCANNER_ID } from './helpers/hermetic-users-v4';

/**
 * Regressions from the combined apps + admin QA on DEV (2026-11-04). Each test pins one fix:
 * table search by entity id, the page h1, dialog focus return, the RC "Needs review" queue the
 * dashboard counts, the Requests tab in the URL, garage actions from the partner page, the plate
 * scanner filter in the URL, and the one date format.
 */
test.describe('Combined QA regressions (hermetic)', () => {
  test('claims: search by claim id, page h1, singular row count, IN date format', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await expect(page.getByRole('heading', { level: 1, name: 'Ownership claims' })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(3, { timeout: 10_000 });

    // The Claim column sorts by status; the id is only the row id — search must still find it.
    await page.getByPlaceholder('Search claim…').fill(HERMETIC_OWNERSHIP_CLAIM_ID);
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('.al-toolbar__meta')).toHaveText('1 row');
    await expect(
      page.getByTestId(`ownership-claim-details-${HERMETIC_OWNERSHIP_CLAIM_ID}`),
    ).toBeVisible();
    // Never the ambiguous en-US "10/20/2026" — always "20 Oct 2026".
    await expect(page.locator('tbody tr').first()).toContainText(/\d{2} [A-Z][a-z]{2} \d{4}/);
    await expect(page.locator('tbody tr').first()).not.toContainText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(capture.unexpected).toEqual([]);
  });

  test('claims: closing the detail returns keyboard focus to the row that opened it', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    await firstRow.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('ownership-claim-detail-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('ownership-claim-detail-sheet')).toHaveCount(0);
    await expect(firstRow).toBeFocused();
  });

  test('claims: Needs review reads SUBMITTED + UNDER_REVIEW (the dashboard RC queue)', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await page.goto('/ownership-claims?status=PENDING');

    await expect(page.getByTestId('filter-chip-PENDING')).toHaveAttribute('aria-pressed', 'true', {
      timeout: 30_000,
    });
    await expect
      .poll(() => capture.ownershipClaimsGetStatusParams)
      .toEqual(expect.arrayContaining(['SUBMITTED', 'UNDER_REVIEW']));
    await expect(
      page.getByTestId(`ownership-claim-details-${HERMETIC_OWNERSHIP_CLAIM_ID}`),
    ).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  test('dashboard RC tile links to the Needs review queue', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-attention-rc-reviews')).toHaveAttribute(
      'href',
      '/ownership-claims?status=PENDING',
      { timeout: 30_000 },
    );
  });

  test('requests inbox: the Taxi tab survives a reload', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnersRequestsPage(page);

    await page.getByTestId('filter-chip-taxi').click();
    await expect(page).toHaveURL(/[?&]tab=taxi/);
    await expect(page.getByText('Kothrud, Pune')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('filter-chip-taxi')).toHaveAttribute('aria-pressed', 'true', {
      timeout: 30_000,
    });
    await expect(page.getByText('Kothrud, Pune')).toBeVisible();
  });

  test('partner page: grant a pass and a free-bid bonus with the org pre-filled', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticPartnersRoutes(page);
    let accessReads = 0;
    await page.route(/\/admin\/v1\/garage\/orgs\/[^/]+\/access$/, async (route) => {
      if (route.request().method() === 'GET') accessReads += 1;
      await route.fallback();
    });
    await seedHermeticSession(page);
    await openPartnerDetailPage(page);

    const access = page.getByTestId('partners-garage-access');
    await expect(access).toContainText('On weekly free bids');
    await expect.poll(() => accessReads).toBeGreaterThanOrEqual(1);

    await page.getByTestId('partners-garage-grant-pass').click();
    const grant = page.getByRole('dialog');
    await expect(grant.getByTestId('garage-grant-org-id')).toHaveValue(HERMETIC_PARTNER_ORG_ID);
    await grant.getByTestId('garage-grant-kind').selectOption('MONTH');
    const readsBeforeGrant = accessReads;
    await grant.getByRole('button', { name: 'Grant pass' }).click();
    await expect.poll(() => base.garagePassGrant.length).toBe(1);
    expect(base.garagePassGrant[0]?.path).toBe(
      `/admin/v1/garage/orgs/${HERMETIC_PARTNER_ORG_ID}/passes/grant`,
    );
    expect(base.garagePassGrant[0]?.body).toMatchObject({ kind: 'MONTH' });
    // The access panel refetches instead of showing the pre-grant state.
    await expect.poll(() => accessReads).toBeGreaterThan(readsBeforeGrant);

    await page.getByTestId('partners-garage-adjust-free-bids').click();
    const adjust = page.getByRole('dialog');
    await expect(adjust.getByTestId('garage-adjust-org-id')).toHaveValue(HERMETIC_PARTNER_ORG_ID);
    await adjust.getByTestId('garage-adjust-delta').fill('2');
    await adjust.getByRole('button', { name: 'Apply to this week' }).click();
    await expect.poll(() => base.garageFreeBidsAdjust.length).toBe(1);
    expect(base.garageFreeBidsAdjust[0]?.body).toMatchObject({ delta: 2 });
  });

  test('plate scanning: View lookups opens the scanner filter from the URL', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);

    await page.goto('/plate-scanning?tab=abuse');
    await page.getByTestId(`plate-abuse-view-lookups-${V4_SCANNER_ID}`).click();
    await expect(page).toHaveURL(new RegExp(`tab=lookups.*account=${V4_SCANNER_ID}`));
    await expect(page.getByTestId('plate-lookups-account')).toHaveValue(V4_SCANNER_ID);
    await expect
      .poll(() => capture.lookups.some((q) => q.includes(`accountId=${V4_SCANNER_ID}`)))
      .toBe(true);

    // A malformed account in a pasted URL is ignored, never sent.
    await page.goto('/plate-scanning?tab=lookups&account=not-a-uuid');
    await expect(page.getByTestId('plate-lookups')).toBeVisible({ timeout: 30_000 });
    expect(capture.lookups.at(-1)).not.toContain('not-a-uuid');
  });
});
