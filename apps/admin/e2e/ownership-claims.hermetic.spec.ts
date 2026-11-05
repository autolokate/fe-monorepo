import { expect, test, type Page } from '@playwright/test';

import {
  HERMETIC_OWNERSHIP_CLAIM_ID,
  HERMETIC_OWNERSHIP_CLAIM_ID_CONFLICT,
  HERMETIC_OWNERSHIP_CLAIM_ID_REJECTED,
  HERMETIC_OWNERSHIP_CLAIM_REJECTION_REASON,
  HERMETIC_RC_MEDIA_ASSET_ID,
  installHermeticApiRoutes,
  openOwnershipClaimsPage,
  seedHermeticSession,
} from './helpers/hermetic';

async function openClaim(page: Page, claimId = HERMETIC_OWNERSHIP_CLAIM_ID) {
  await page.getByTestId(`ownership-claim-details-${claimId}`).click();
  await expect(page.getByTestId('ownership-claim-detail-sheet')).toBeVisible({ timeout: 10_000 });
}

/**
 * Hermetic ownership-claim review against the ownership-rules contract (stubbed HTTP only).
 * Does NOT prove Live OPERATOR / step-up / the server reviewer allowlist / Admin media ACL.
 */
test.describe('Ownership claims (hermetic)', () => {
  test('queue — plate, claimant handle, advisory registry chip; no decision buttons on rows', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await expect(page.getByTestId('filter-chip-ALL')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(3, { timeout: 10_000 });
    await expect(page.getByRole('cell', { name: 'DL7CQ1939' }).first()).toBeVisible();
    await expect(page.getByText('@hermetic_customer').first()).toBeVisible();
    await expect(page.getByText('Registry: mismatch').first()).toBeVisible();
    await expect(
      page.getByTestId(`ownership-claim-resubmission-${HERMETIC_OWNERSHIP_CLAIM_ID}`),
    ).toContainText('Resubmission #2');
    // ADM-OWN-04: approving is impossible from the table.
    const table = page.getByRole('table');
    await expect(table.getByRole('button', { name: /approve|reject/i })).toHaveCount(0);
    expect(capture.ownershipClaimsGetStatusParams[0]).toBeNull();

    await page.getByTestId('filter-chip-SUBMITTED').click();
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(1, { timeout: 10_000 });
    expect(capture.ownershipClaimsGetStatusParams).toContain('SUBMITTED');
    expect(capture.unexpected).toEqual([]);
  });

  test('pagination — Load more follows the keyset cursor beyond the first page', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsPaged: true,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(1, { timeout: 10_000 });
    await page.getByTestId('ownership-claims-load-more').click();
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(3, { timeout: 10_000 });
    await expect(page.getByTestId('ownership-claims-load-more')).toHaveCount(0);
    expect(capture.ownershipClaimsGetCursorParams).toContain('2026-10-19T00:00:00.000Z|page-2');
    expect(capture.unexpected).toEqual([]);
  });

  test('detail — comparison, advisory checks, joint RC, history; approve blocked until RC is viewed', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);

    const sheet = page.getByTestId('ownership-claim-detail-sheet');
    await expect(sheet).toContainText('DL7CQ1939', { timeout: 10_000 });
    await expect(page.getByTestId('ownership-claim-notes')).toContainText(
      'Hermetic RC claim notes',
    );
    await expect(page.getByTestId('ownership-claim-claimant-link')).toHaveText(
      '@hermetic_customer',
    );
    await expect(page.getByTestId('ownership-claim-current-owner')).toContainText('The claimant');
    await expect(page.getByTestId('ownership-claim-role')).toContainText('Provisional owner');
    await expect(page.getByTestId('ownership-claim-precheck')).toContainText('(advisory)');
    await expect(page.getByTestId('ownership-claim-rc-checks')).toContainText('12345');
    await expect(page.getByTestId('ownership-claim-advisory-note')).toContainText('advisory only');
    await expect(page.getByTestId('ownership-claim-joint-rc-note')).toContainText('Joint RC');
    await expect(page.getByTestId('ownership-claim-attempt')).toContainText('Attempt 2 of 2');
    await expect(
      page.getByTestId(`ownership-claim-history-${HERMETIC_OWNERSHIP_CLAIM_ID_REJECTED}`),
    ).toContainText(HERMETIC_OWNERSHIP_CLAIM_REJECTION_REASON);
    await expect(page.getByTestId('ownership-history')).toContainText(
      'Provisional ownership expired',
    );
    await expect(page.getByTestId('ownership-claim-plate-rows-none')).toBeVisible();
    await expect(page.getByTestId('ownership-claim-rc-asset-id')).toContainText(
      HERMETIC_RC_MEDIA_ASSET_ID.slice(0, 8),
    );
    await expect(page.getByTestId('ownership-claim-rc-blocker')).toContainText(
      'Preview unavailable for this claim',
    );
    await expect(page.getByTestId('ownership-claim-detail-approve')).toBeDisabled();
    await expect(page.getByTestId('ownership-claim-approve-blocker')).toContainText(
      'view the RC before approving',
    );
    expect(capture.ownershipClaimsRcProofGet[0]?.path).toBe(
      `/admin/v1/ownership-claims/${HERMETIC_OWNERSHIP_CLAIM_ID}/rc-proof`,
    );
    expect(capture.ownershipHistoryGet.length).toBeGreaterThanOrEqual(1);
    expect(capture.ownershipPlateSearch).toContain('DL7CQ1939');
    expect(capture.unexpected).toEqual([]);
  });

  test('reject — remarks are mandatory; the POST carries them', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);

    await page.getByTestId('ownership-claim-detail-reject').click();
    await page.getByTestId('ownership-decision-confirm').click();
    await expect(page.getByTestId('ownership-decision-remarks-error')).toContainText('required');
    expect(capture.ownershipClaimsReview).toHaveLength(0);

    await page.getByTestId('ownership-decision-remarks').fill('RC plate mismatch');
    await page.getByTestId('ownership-decision-confirm').click();
    await expect.poll(() => capture.ownershipClaimsReview.length, { timeout: 10_000 }).toBe(1);
    expect(capture.ownershipClaimsReview[0]?.body).toEqual({
      decision: 'REJECTED',
      remarks: 'RC plate mismatch',
    });
    await expect(page.getByTestId('ownership-claim-review-remarks')).toContainText(
      'RC plate mismatch',
      { timeout: 10_000 },
    );
    expect(capture.unexpected).toEqual([]);
  });

  test('approve — after viewing the RC, with remarks; shows the transfer outcome', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsRcProofGetStatus: 200,
      ownershipConflictingClaim: true,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);

    await expect(
      page.getByTestId(`ownership-claim-conflict-${HERMETIC_OWNERSHIP_CLAIM_ID_CONFLICT}`),
    ).toContainText('@hermetic_driver', { timeout: 10_000 });
    await expect(page.getByTestId('ownership-claim-rc-pdf')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
    );
    // ADM-OWN-08: no "open in new tab" for the signed link.
    await expect(page.getByRole('link', { name: /new tab/i })).toHaveCount(0);

    await expect(page.getByTestId('ownership-claim-detail-approve')).toBeEnabled();
    await page.getByTestId('ownership-claim-detail-approve').click();
    await expect(page.getByTestId('ownership-decision-summary')).toContainText(
      'removed — not kept as a driver',
    );
    await page.getByTestId('ownership-decision-confirm').click();
    await expect(page.getByTestId('ownership-decision-remarks-error')).toBeVisible();
    expect(capture.ownershipClaimsReview).toHaveLength(0);

    await page.getByTestId('ownership-decision-remarks').fill('RC names the claimant; chassis ok');
    await page.getByTestId('ownership-decision-confirm').click();
    await expect.poll(() => capture.ownershipClaimsReview.length, { timeout: 10_000 }).toBe(1);
    expect(capture.ownershipClaimsReview[0]?.body).toEqual({
      decision: 'APPROVED',
      remarks: 'RC names the claimant; chassis ok',
    });

    const outcome = page.getByTestId('ownership-transfer-outcome').first();
    await expect(outcome).toContainText('Ownership transferred', { timeout: 10_000 });
    await expect(page.getByTestId('ownership-outcome-drivers').first()).toContainText('2', {
      timeout: 10_000,
    });
    await expect(page.getByTestId('ownership-outcome-previous-owner').first()).toContainText(
      'eeeeeeee',
    );
    await expect(page.getByTestId('ownership-history')).toContainText('Claim approved');
    expect(capture.unexpected).toEqual([]);
  });

  test('not an authorized reviewer — no approve/reject, clear notice, under review still allowed', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipReviewCanDecide: false,
      ownershipClaimsRcProofGetStatus: 200,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    await expect(page.getByTestId('ownership-claims-not-reviewer')).toContainText(
      'not an authorized ownership reviewer',
    );
    await openClaim(page);
    await expect(page.getByTestId('ownership-claim-not-reviewer')).toContainText(
      "You're not an authorized ownership reviewer",
    );
    await expect(page.getByTestId('ownership-claim-detail-approve')).toHaveCount(0);
    await expect(page.getByTestId('ownership-claim-detail-reject')).toHaveCount(0);

    await page.getByTestId('ownership-claim-detail-under-review').click();
    await expect.poll(() => capture.ownershipClaimsReview.length, { timeout: 10_000 }).toBe(1);
    expect(capture.ownershipClaimsReview[0]?.body).toEqual({ decision: 'UNDER_REVIEW' });
    expect(capture.ownershipReviewAccessGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('reviewer check failing fails closed (no decide buttons)', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipReviewAccessStatus: 500,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);
    await expect(page.getByTestId('ownership-claim-not-reviewer')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('ownership-claim-detail-approve')).toHaveCount(0);
  });

  test('plate verified on another row — approve blocked with a duplicate-plate notice', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsRcProofGetStatus: 200,
      ownershipVerifiedElsewhere: true,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await expect(
      page.getByTestId(`ownership-claim-plate-conflict-${HERMETIC_OWNERSHIP_CLAIM_ID}`),
    ).toContainText('verified elsewhere');
    await openClaim(page);

    await expect(page.getByTestId('ownership-claim-verified-elsewhere')).toBeVisible();
    await expect(page.getByTestId('ownership-claim-plate-rows')).toContainText('RC verified');
    await expect(page.getByTestId('ownership-claim-detail-approve')).toBeDisabled();
    await expect(page.getByTestId('ownership-claim-approve-blocker')).toContainText(
      'Resolve the duplicate plate first',
    );
    expect(capture.ownershipClaimsReview).toHaveLength(0);
    expect(capture.unexpected).toEqual([]);
  });

  test('step-up expired on decide — the step-up 2FA gate takes over', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsRcProofGetStatus: 200,
      ownershipReviewStatus: 403,
      ownershipReviewErrorCode: 'step_up_required',
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);
    await page.getByTestId('ownership-claim-detail-approve').click();
    await page.getByTestId('ownership-decision-remarks').fill('RC verified');
    await page.getByTestId('ownership-decision-confirm').click();
    // The admin plane re-prompts for step-up (2FA) globally; nothing was decided.
    await expect(page.getByTestId('admin-step-up')).toBeVisible({ timeout: 15_000 });
    expect(capture.ownershipClaimsReview).toHaveLength(1);
  });

  test('server refusal — plate_verified_elsewhere is explained', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsRcProofGetStatus: 200,
      ownershipReviewStatus: 409,
      ownershipReviewErrorCode: 'plate_verified_elsewhere',
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);
    await page.getByTestId('ownership-claim-detail-approve').click();
    await page.getByTestId('ownership-decision-remarks').fill('RC verified');
    await page.getByTestId('ownership-decision-confirm').click();
    await expect(page.getByTestId('ownership-decision-error')).toContainText(
      'Resolve the duplicate plate first',
    );
  });

  test('roster unavailable — the claim is still readable', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      vehicleDriversStatus: 404,
    });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await openClaim(page);
    await expect(page.getByTestId('ownership-claim-role-unavailable')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('ownership-claim-role')).toHaveCount(0);
    await expect(page.getByTestId('ownership-claim-detail-reject')).toBeEnabled();
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
