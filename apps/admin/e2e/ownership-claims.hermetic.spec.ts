import { expect, test } from '@playwright/test';

import {
  HERMETIC_OWNERSHIP_CLAIM_ID,
  installHermeticApiRoutes,
  openOwnershipClaimsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic ownership-claims list + review wiring.
 * Does NOT prove Live OPERATOR / migrate 0072.
 */
test.describe('Ownership claims (hermetic)', () => {
  test('ALL filter + approve — GET/POST review wiring', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);

    // Default filter is ALL — stub returns submitted + already-approved rows; omits status.
    await expect(page.getByTestId('filter-chip-ALL')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(2, { timeout: 10_000 });
    expect(capture.ownershipClaimsGet).toBeGreaterThanOrEqual(1);
    expect(capture.ownershipClaimsGetStatusParams[0]).toBeNull();

    await page.getByRole('button', { name: 'Approve', exact: true }).click();
    await expect
      .poll(() => capture.ownershipClaimsReview.length, { timeout: 10_000 })
      .toBe(1);
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
    await expect(page.getByRole('cell', { name: 'cccccccc' })).toHaveCount(2, { timeout: 10_000 });
    expect(capture.ownershipClaimsGetStatusParams).toContain(null);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      ownershipClaimsGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/ownership-claims', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});

test.describe('Admin plane role banner (hermetic)', () => {
  test('CONSUMER session shows missing OPERATOR banner', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'CONSUMER' });
    await seedHermeticSession(page);
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('admin-plane-role-missing')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('admin-plane-role-missing')).toContainText('OPERATOR');
  });

  test('ADMIN session does not show missing-role banner', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipClaimsPage(page);
    await expect(page.getByTestId('admin-plane-role-missing')).toHaveCount(0);
  });
});
