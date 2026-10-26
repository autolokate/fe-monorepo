import { expect, test } from '@playwright/test';

import {
  HERMETIC_CUSTOMER_PHONE,
  HERMETIC_UNKNOWN_PHONE,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * `GET /admin/v1/users*` is on live Dev OA. Hermetics mock HTTP — they do not prove Live
 * OPERATOR/step_up. Role grant/revoke remains G0-4 blocked.
 */
test.describe('Users directory (hermetic)', () => {
  test('directory + phone search — Nest CONSUMER role + grant/revoke hidden', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openUsersPage(page);

    await page.getByTestId('users-lookup-phone').fill(HERMETIC_CUSTOMER_PHONE);
    await page.getByTestId('users-lookup-submit').click();

    await expect(page.getByText('CONSUMER').first()).toBeVisible({ timeout: 10_000 });
    expect(capture.usersLookupGet.some((entry) => entry.phone === HERMETIC_CUSTOMER_PHONE)).toBe(
      true,
    );

    await expect(page.getByTestId('users-grant-admin')).toHaveCount(0);
    await expect(page.getByTestId('users-revoke-admin')).toHaveCount(0);
    expect(capture.usersGrantPost).toEqual([]);
    expect(capture.usersRevokeDelete).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('empty — unknown phone shows empty directory (not invented hit)', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openUsersPage(page);

    await page.getByTestId('users-lookup-phone').fill(HERMETIC_UNKNOWN_PHONE);
    await page.getByTestId('users-lookup-submit').click();

    await expect(page.getByText('No accounts found')).toBeVisible({ timeout: 10_000 });
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
