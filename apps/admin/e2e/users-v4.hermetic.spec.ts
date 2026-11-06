import { expect, test, type Page } from '@playwright/test';

import {
  HERMETIC_CUSTOMER_ACCOUNT_ID,
  HERMETIC_VEHICLE_ID,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';
import { installUsersV4Routes } from './helpers/hermetic-users-v4';

async function openAccount(page: Page): Promise<void> {
  await openUsersPage(page);
  await page.getByText(HERMETIC_CUSTOMER_ACCOUNT_ID.slice(0, 8), { exact: true }).first().click();
  await expect(page.getByTestId('users-roles-panel')).toBeVisible({ timeout: 10_000 });
}

/** Admin v4 on the customer detail: audited inbox + trips, driver invites, role revoke reason. */
test.describe('Users v4 panels (hermetic)', () => {
  test('notifications load only on request (audited) and page with Load more', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);
    await openAccount(page);

    await expect(page.getByTestId('user-notifications-audit-note')).toContainText(
      'Viewing writes an audit row',
    );
    // Audited read: nothing fetched before the operator opts in.
    expect(capture.notifications).toEqual([]);
    expect(capture.devices).toBe(0);

    await page.getByTestId('user-notifications-load').click();
    const inbox = page.getByTestId('user-notifications');
    await expect(inbox).toContainText('Hermetic maintenance notice', { timeout: 10_000 });
    await expect(inbox).toContainText('Delivered');
    await expect(inbox).toContainText('Push');
    await expect(page.getByTestId('user-devices')).toContainText('…a1b2c3');
    expect(capture.notifications).toHaveLength(1);

    await page.getByTestId('user-notifications-load-more').click();
    await expect(inbox).toContainText('Hermetic in-app only');
    await expect(inbox).toContainText('No send recorded');
    expect(capture.notifications[1]).toContain('cursor=n-cursor-1');

    await page.getByTestId('filter-chip-PARTNER').click();
    await expect
      .poll(() => capture.notifications.some((q) => q.includes('audience=PARTNER')))
      .toBe(true);
  });

  test('DriveQuant trips + score are gated and filter by date', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);
    await openAccount(page);
    await page.getByRole('tab', { name: 'Driving' }).click();

    await expect(page.getByTestId('user-trips-audit-note')).toContainText('DRIVER_TRIP_ACCESS');
    expect(capture.trips).toEqual([]);
    expect(capture.driverScore).toBe(0);

    await page.getByTestId('user-trips-load').click();
    await expect(page.getByTestId('user-driver-score')).toContainText('8.4', { timeout: 10_000 });
    await expect(page.getByTestId('user-driver-score')).toContainText('Hermetic score disclaimer.');
    await expect(page.getByTestId('user-trips')).toContainText('18.4 km');
    await expect(page.getByTestId('user-trips')).toContainText('Verified');

    await page.getByTestId('user-trips-from').fill('2026-11-01');
    await page.getByTestId('user-trips-apply').click();
    await expect.poll(() => capture.trips.some((q) => q.includes('from='))).toBe(true);
  });

  test('driver invites show on the account and on a vehicle', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);
    await openAccount(page);

    const received = page.getByTestId('user-driver-invites');
    await expect(received).toContainText('Accepted', { timeout: 10_000 });
    await expect(received).toContainText('••••4321');

    await page
      .getByRole('region', { name: 'Vehicles', exact: true })
      .getByText('DL7CQ1939')
      .click();
    const vehicleInvites = page.getByTestId('vehicle-driver-invites');
    await expect(vehicleInvites).toContainText('Pending', { timeout: 10_000 });
    await expect(vehicleInvites).toContainText('Weekend driver');
    await expect(vehicleInvites).toContainText('hermetic_owner');
    expect(capture.vehicleInvites).toContain(HERMETIC_VEHICLE_ID);
  });

  test('role revoke sends an optional reason only when typed', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);
    await openAccount(page);

    await page.getByTestId('users-role-revoke-CONSUMER').click();
    // 1–2 chars is below the server minimum → confirm disabled.
    await page.getByTestId('users-role-reason').fill('no');
    await expect(page.getByTestId('users-role-confirm')).toBeDisabled();
    await page.getByTestId('users-role-reason').fill('Duplicate account, merged');
    await page.getByTestId('users-role-confirm').click();
    await expect.poll(() => capture.roleRevoke.length).toBe(1);
    expect(JSON.parse(capture.roleRevoke[0]?.body ?? '{}')).toEqual({
      reason: 'Duplicate account, merged',
    });
  });

  test('deep link /users?account= opens that account', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page);
    await seedHermeticSession(page);
    await page.goto(`/users?account=${HERMETIC_CUSTOMER_ACCOUNT_ID}`);
    await expect(page.getByTestId('users-roles-panel')).toBeVisible({ timeout: 30_000 });
  });
});
