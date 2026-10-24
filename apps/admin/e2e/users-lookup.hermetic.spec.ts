import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';
import {
  HERMETIC_CUSTOMER_PHONE,
  HERMETIC_UNKNOWN_PHONE,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';

const skipReason =
  unsupportedSpecSkipReason('users-lookup.hermetic.spec.ts') ??
  'GET /admin/v1/users absent from live Dev OA';

/**
 * Live Dev OA: GET /admin/v1/users absent (Phase 11). Hermetic mock ≠ Live Supported.
 * Role grant/revoke remains G0-4 blocked. Skipped ≠ passed.
 */
test.describe.skip(`Users lookup (hermetic) — ${skipReason}`, () => {
  test('lookup — Nest CONSUMER role + grant/revoke hidden', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openUsersPage(page);

    await page.getByTestId('users-lookup-phone').fill(HERMETIC_CUSTOMER_PHONE);
    await page.getByTestId('users-lookup-submit').click();

    const account = page.getByRole('region', { name: 'Account roles' });
    await expect(account).toBeVisible({ timeout: 10_000 });
    await expect(account.getByText('CONSUMER')).toBeVisible();
    expect(capture.usersLookupGet).toEqual([{ phone: HERMETIC_CUSTOMER_PHONE }]);

    await expect(page.getByTestId('users-grant-admin')).toHaveCount(0);
    await expect(page.getByTestId('users-revoke-admin')).toHaveCount(0);
    expect(capture.usersGrantPost).toEqual([]);
    expect(capture.usersRevokeDelete).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — unknown phone surfaces inline 404', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openUsersPage(page);

    await page.getByTestId('users-lookup-phone').fill(HERMETIC_UNKNOWN_PHONE);
    await page.getByTestId('users-lookup-submit').click();

    await expect(page.getByTestId('users-lookup-error')).toContainText(
      'No account is registered for that phone number.',
      { timeout: 10_000 },
    );
    await expect(page.getByRole('region', { name: 'Account roles' })).toHaveCount(0);
    expect(capture.usersGrantPost).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY sees Access denied', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await page.goto('/users', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Access denied')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('users-lookup-submit')).toHaveCount(0);
    expect(capture.usersLookupGet).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });
});
