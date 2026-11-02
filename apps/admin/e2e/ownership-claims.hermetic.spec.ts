import { expect, test } from '@playwright/test';

import {
  HERMETIC_OWNERSHIP_CLAIM_ID,
  HERMETIC_OWNERSHIP_CLAIM_ID_REJECTED,
  HERMETIC_OWNERSHIP_CLAIM_REJECTION_REASON,
  HERMETIC_RC_MEDIA_ASSET_ID,
  installHermeticApiRoutes,
  openOwnershipClaimsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic ownership-claims list + review wiring.
 * Does NOT prove Live OPERATOR / migrate 0072 / Admin media ACL.
 */
test.describe('Ownership claims (hermetic)', () => {
  test('ALL filter + approve confirm — GET/POST review wiring', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    // Default filter is ALL — stub returns submitted + approved + earlier rejected rows; omits status.
    await expect(page.getByTestId('filter-chip-ALL')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(3, { timeout: 10_000 });
    // Flow v3 resubmission: the SUBMITTED claim follows a rejected attempt for the same vehicle.
    await expect(
      page.getByTestId(`ownership-claim-resubmission-${HERMETIC_OWNERSHIP_CLAIM_ID}`),
    ).toContainText('Resubmission #2');
    expect(capture.ownershipClaimsGet).toBeGreaterThanOrEqual(1);
    expect(capture.ownershipClaimsGetStatusParams[0]).toBeNull();

    await page.getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('alertdialog')).toContainText('transfers this vehicle');
    await page.getByRole('button', { name: 'Approve and transfer ownership' }).click();
    await expect.poll(() => capture.ownershipClaimsReview.length, { timeout: 10_000 }).toBe(1);
    expect(capture.ownershipClaimsReview[0]?.path).toBe(
      `/admin/v1/ownership-claims/${HERMETIC_OWNERSHIP_CLAIM_ID}/review`,
    );
    expect(capture.ownershipClaimsReview[0]?.body).toMatchObject({ decision: 'APPROVED' });

    // Narrow to Submitted — approved row leaves that filter.
    await page.getByTestId('filter-chip-SUBMITTED').click();
    await expect(page.getByTestId('filter-chip-SUBMITTED')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('No ownership claims')).toBeVisible({ timeout: 10_000 });
    expect(capture.ownershipClaimsGetStatusParams).toContain('SUBMITTED');

    // Round-trip back to ALL — UI restores full catalog (may hit React Query cache).
    await page.getByTestId('filter-chip-ALL').click();
    await expect(page.getByTestId('filter-chip-ALL')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(3, { timeout: 10_000 });
    expect(capture.ownershipClaimsGetStatusParams).toContain(null);
    expect(capture.unexpected).toEqual([]);
  });

  test('detail sheet — short IDs + RC ACL blocker + reject with editable reason', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await page.getByTestId(`ownership-claim-details-${HERMETIC_OWNERSHIP_CLAIM_ID}`).click();
    await expect(page.getByTestId('ownership-claim-detail-sheet')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('ownership-claim-detail-sheet')).toContainText(
      HERMETIC_OWNERSHIP_CLAIM_ID.slice(0, 8),
    );
    await expect(page.getByTestId('ownership-claim-notes')).toContainText(
      'Hermetic RC claim notes',
    );
    // Vehicle + claimant context from GET /admin/v1/vehicles/{id}/drivers.
    const sheet = page.getByTestId('ownership-claim-detail-sheet');
    await expect(sheet).toContainText('DL7CQ1939', { timeout: 10_000 });
    await expect(page.getByTestId('ownership-claim-role')).toContainText('Provisional owner');
    await expect(sheet).toContainText('Claim role (current)');
    await expect(page.getByTestId('ownership-claim-attempt')).toContainText('Attempt 2 of 2');
    await expect(page.getByTestId('ownership-claim-history')).toBeVisible();
    await expect(
      page.getByTestId(`ownership-claim-history-${HERMETIC_OWNERSHIP_CLAIM_ID_REJECTED}`),
    ).toContainText(HERMETIC_OWNERSHIP_CLAIM_REJECTION_REASON);
    await expect(
      page.getByTestId(`ownership-claim-history-${HERMETIC_OWNERSHIP_CLAIM_ID}`),
    ).toContainText('this claim');
    await expect(page.getByTestId('ownership-claim-audit-hint')).toContainText('Activity Log');
    await expect(page.getByTestId('ownership-claim-rc-asset-id')).toContainText(
      HERMETIC_RC_MEDIA_ASSET_ID.slice(0, 8),
    );
    await expect(page.getByTestId('ownership-claim-rc-blocker')).toContainText(
      'Preview unavailable for this claim',
    );
    expect(capture.ownershipClaimsRcProofGet.length).toBeGreaterThanOrEqual(1);
    expect(capture.ownershipClaimsRcProofGet[0]?.path).toBe(
      `/admin/v1/ownership-claims/${HERMETIC_OWNERSHIP_CLAIM_ID}/rc-proof`,
    );

    await page.getByTestId('ownership-claim-detail-reject').click();
    await expect(page.getByTestId('ownership-claim-reject-reason')).toBeVisible();
    await page.getByTestId('ownership-claim-reject-reason').fill('RC plate mismatch');
    await page.getByTestId('ownership-claim-reject-confirm').click();
    await expect.poll(() => capture.ownershipClaimsReview.length, { timeout: 10_000 }).toBe(1);
    expect(capture.ownershipClaimsReview[0]?.body).toMatchObject({
      decision: 'REJECTED',
      rejectionReason: 'RC plate mismatch',
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('reject requires a reason — empty reason never POSTs', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await page.getByTestId(`ownership-claim-details-${HERMETIC_OWNERSHIP_CLAIM_ID}`).click();
    await page.getByTestId('ownership-claim-detail-reject').click();
    await page.getByTestId('ownership-claim-reject-confirm').click();
    await expect(page.getByText('Enter a rejection reason.')).toBeVisible();
    expect(capture.ownershipClaimsReview).toHaveLength(0);
    expect(capture.unexpected).toEqual([]);
  });

  test('roster unavailable — claim review still works without vehicle context', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      vehicleDriversStatus: 404,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await page.getByTestId(`ownership-claim-details-${HERMETIC_OWNERSHIP_CLAIM_ID}`).click();
    await expect(page.getByTestId('ownership-claim-role-unavailable')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('ownership-claim-role')).toHaveCount(0);
    await expect(page.getByTestId('ownership-claim-detail-approve')).toBeEnabled();
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/ownership-claims', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByText('The server refused this action for your operator session.'),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});

test.describe('Admin plane role banner (hermetic)', () => {
  test('permission — CONSUMER (not OPERATOR) gets the access-denied gate, no admin calls', async ({
    page,
  }) => {
    // ADM-03: the server has a single admin role (OPERATOR); any other session never sees the shell.
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'CONSUMER' });
    await seedHermeticSession(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('admin-access-denied')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toHaveCount(0);
    expect(capture.unexpected).toEqual([]);
  });

  test('ADMIN session does not show missing-role banner', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await expect(page.getByTestId('admin-plane-role-missing')).toHaveCount(0);
  });
});
