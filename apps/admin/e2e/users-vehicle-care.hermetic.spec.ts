import { expect, test } from '@playwright/test';

import {
  HERMETIC_CUSTOMER_ACCOUNT_ID,
  HERMETIC_EXPENSE_TITLE_A,
  HERMETIC_EXPENSE_TITLE_B,
  HERMETIC_SERVICE_LOG_TITLE_A,
  HERMETIC_SERVICE_LOG_TITLE_B,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/** Short account id shown in the directory Account column (never full UUID as primary). */
const SHORT_ACCOUNT_ID = HERMETIC_CUSTOMER_ACCOUNT_ID.slice(0, 8);

/**
 * Account root vs vehicle drill-in for Admin care same-records.
 * Hermetic-only — does not claim Live write or Live OA beyond stubbed GETs.
 */
test.describe('Users vehicle care hierarchy (hermetic)', () => {
  test('root shows contacts + vehicles; vehicle view filters expenses (no cross-vehicle leak)', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openUsersPage(page);

    await page.getByText(SHORT_ACCOUNT_ID, { exact: true }).first().click();

    await expect(page.getByRole('heading', { name: 'Emergency contacts' })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Hermetic Contact')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible();
    await expect(page.getByText('DL7CQ1939')).toBeVisible();
    await expect(page.getByText('MH12AB9999')).toBeVisible();
    // Vehicle-scoped tables must not appear on account root.
    await expect(page.getByRole('heading', { name: 'Expenses' })).toHaveCount(0);
    await expect(page.getByText(HERMETIC_EXPENSE_TITLE_A)).toHaveCount(0);
    await expect(page.getByText(HERMETIC_EXPENSE_TITLE_B)).toHaveCount(0);

    await page.getByText('DL7CQ1939').click();

    await expect(page.getByTestId('users-back-to-account')).toBeVisible();
    await expect(page.getByTestId('users-vehicle-care-ro')).toContainText('read-only');
    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible();
    await expect(page.getByText(HERMETIC_EXPENSE_TITLE_A)).toBeVisible();
    await expect(page.getByText(HERMETIC_EXPENSE_TITLE_B)).toHaveCount(0);
    await expect(page.getByText('Hermetic job vehicle A')).toBeVisible();
    await expect(page.getByText('Hermetic job vehicle B LEAK')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Service logs' })).toBeVisible();
    await expect(page.getByText(HERMETIC_SERVICE_LOG_TITLE_A)).toBeVisible();
    await expect(page.getByText(HERMETIC_SERVICE_LOG_TITLE_B)).toHaveCount(0);
    await expect(page.getByText('Hermetic RC vehicle A')).toBeVisible();
    await expect(page.getByText('Hermetic insurance vehicle B LEAK')).toHaveCount(0);
    // Account-scoped contacts stay off the vehicle pane.
    await expect(page.getByRole('heading', { name: 'Emergency contacts' })).toHaveCount(0);
  });
});
