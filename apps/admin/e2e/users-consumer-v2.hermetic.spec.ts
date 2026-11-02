import { expect, test } from '@playwright/test';

import {
  HERMETIC_CUSTOMER_ACCOUNT_ID,
  HERMETIC_ROSTER_DRIVER_PLATE,
  HERMETIC_ROSTER_OTHER_ACCOUNT_ID,
  HERMETIC_ROSTER_OTHER_NAME,
  HERMETIC_ROSTER_OTHER_USERNAME,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';

const SHORT_ACCOUNT_ID = HERMETIC_CUSTOMER_ACCOUNT_ID.slice(0, 8);

/**
 * Consumer v2 on the customer detail: plan / premium access, streak, and per-vehicle role, all read
 * from `GET /admin/v1/users/{id}/entitlements` + `/streak`. Hermetic only: these routes are not on
 * the shared dev API yet, so the stubs mirror the backend OpenAPI (AccountEntitlementsDto / StreakDto).
 */
test.describe('Users consumer v2 state (hermetic)', () => {
  test('shows plan, premium flags, streak and vehicle memberships from the API', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openUsersPage(page);
    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();

    const plan = page.getByTestId('users-plan');
    await expect(plan).toBeVisible({ timeout: 10_000 });
    await expect(plan).toContainText('Paid');
    await expect(plan).toContainText('Shield');
    await expect(plan).toContainText('Subscription');
    await expect(page.getByTestId('users-feature-driveQuant')).toContainText('Unlocked');
    await expect(page.getByTestId('users-feature-academy')).toContainText('Unlocked');
    await expect(page.getByTestId('users-feature-ai')).toContainText('Locked');

    const streak = page.getByRole('region', { name: 'Streak' });
    await expect(streak).toContainText('5 days');
    await expect(streak).toContainText('12 days');
    await expect(streak).toContainText('Active today');
    await expect(streak).toContainText('Used');
    await expect(streak).toContainText('02 Nov 2026');

    const memberships = page.getByRole('region', { name: 'Vehicle memberships' });
    await expect(memberships).toContainText('Provisional owner');
    await expect(memberships).toContainText('Owner');
    await expect(memberships).toContainText('Driver');
    await expect(memberships).toContainText('Verified');
    // A driver membership whose vehicle isn't in the account's vehicle list falls back to its id.
    await expect(memberships).toContainText('dddddddd');
    await expect(page.getByTestId('users-memberships-drivers-note')).toBeVisible();

    // A driver-only membership opens the vehicle's owner + driver roster inline.
    await memberships.getByText('dddddddd').click();
    const membershipRoster = page.getByTestId('membership-roster');
    await expect(membershipRoster).toContainText(HERMETIC_ROSTER_OTHER_USERNAME, {
      timeout: 10_000,
    });
    await expect(membershipRoster).toContainText('Owner');
    await expect(membershipRoster).toContainText('This customer');
    await expect(
      page.getByRole('heading', { name: `Owner & drivers · ${HERMETIC_ROSTER_DRIVER_PLATE}` }),
    ).toBeVisible();

    // Opening an owned vehicle shows the customer's role there (not an assumed "owner").
    await memberships.getByText('DL7CQ1939').click();
    await expect(page.getByTestId('users-back-to-account')).toBeVisible();
    await expect(page.getByText("Customer's role")).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'DL7CQ1939', exact: true }).getByText('Provisional owner'),
    ).toBeVisible();

    expect(capture.unexpected).toEqual([]);
  });

  test('vehicle care lists the owner + driver roster and opens a driver account', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openUsersPage(page);
    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();

    const vehiclesPanel = page.getByRole('region', { name: 'Vehicles', exact: true });
    await vehiclesPanel.getByText('DL7CQ1939').click();

    const roster = page.getByTestId('vehicle-care-roster');
    await expect(roster).toContainText('hermetic_customer', { timeout: 10_000 });
    await expect(roster).toContainText('Provisional owner');
    await expect(roster).toContainText('RC not verified');
    await expect(roster).toContainText(HERMETIC_ROSTER_OTHER_USERNAME);
    await expect(roster).toContainText('Active');
    // A driver without a username falls back to the short account id; removed memberships stay listed.
    await expect(roster).toContainText('eeeeeeee');
    await expect(roster).toContainText('Removed');

    await page.getByTestId(`vehicle-care-roster-open-${HERMETIC_ROSTER_OTHER_ACCOUNT_ID}`).click();
    await expect(page.getByRole('heading', { name: HERMETIC_ROSTER_OTHER_NAME })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(HERMETIC_ROSTER_OTHER_ACCOUNT_ID.slice(0, 8)).first(),
    ).toBeVisible();
    expect(capture.unexpected).toEqual([]);
  });

  test('roster route not deployed shows an honest state', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR', vehicleDriversStatus: 404 });
    await seedHermeticSession(page);
    await openUsersPage(page);
    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();
    await page
      .getByRole('region', { name: 'Vehicles', exact: true })
      .getByText('DL7CQ1939')
      .click();
    await expect(page.getByTestId('admin-not-deployed')).toContainText(
      'GET /admin/v1/vehicles/{vehicleId}/drivers',
      { timeout: 10_000 },
    );
  });

  test('free account shows every premium feature locked', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      usersEntitlements: {
        paid: false,
        planTier: null,
        source: 'NONE',
        expiresAt: null,
        features: { driveQuant: false, leaderboard: false, academy: false, ai: false },
        vehicles: [],
      },
    });
    await seedHermeticSession(page);
    await openUsersPage(page);
    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();

    const plan = page.getByTestId('users-plan');
    await expect(plan).toContainText('Free (no active plan)', { timeout: 10_000 });
    for (const key of ['driveQuant', 'leaderboard', 'academy', 'ai']) {
      await expect(page.getByTestId(`users-feature-${key}`)).toContainText('Locked');
    }
    await expect(page.getByText('No vehicle memberships')).toBeVisible();
  });

  test('routes not deployed show an honest state, never fake data', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR', usersConsumerV2Status: 404 });
    await seedHermeticSession(page);
    await openUsersPage(page);
    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();

    await expect(page.getByTestId('admin-not-deployed').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('/admin/v1/users/{userId}/streak')).toBeVisible();
    await expect(page.getByTestId('users-plan')).toHaveCount(0);
    // The rest of the account still renders.
    await expect(page.getByRole('heading', { name: 'Emergency contacts' })).toBeVisible();
  });

  test('a server error shows a retryable error state', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR', usersConsumerV2Status: 500 });
    await seedHermeticSession(page);
    await openUsersPage(page);
    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();

    const plan = page.getByRole('region', { name: 'Plan & premium access' });
    await expect(plan.getByRole('button', { name: 'Try again' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('users-plan')).toHaveCount(0);
  });
});
