import { expect, test, type Page } from '@playwright/test';

import {
  HERMETIC_CUSTOMER_ACCOUNT_ID,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic platform-role grant/revoke — stubbed POST/DELETE /admin/v1/users/{id}/roles*.
 * Proves the FE wiring only (OPERATOR, never ADMIN); the dev API does not serve these routes yet.
 */
async function openAccount(page: Page): Promise<void> {
  await openUsersPage(page);
  await page.getByText(HERMETIC_CUSTOMER_ACCOUNT_ID.slice(0, 8), { exact: true }).first().click();
  await expect(page.getByTestId('users-roles-panel')).toBeVisible({ timeout: 10_000 });
}

test.describe('User roles (hermetic)', () => {
  test('grant OPERATOR after confirmation sends {role: OPERATOR}', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openAccount(page);

    await page.getByTestId('users-role-grant-OPERATOR').click();
    expect(capture.usersGrantPost).toEqual([]);
    await page.getByTestId('users-role-confirm').click();

    await expect.poll(() => capture.usersGrantPost.length).toBe(1);
    expect(capture.usersGrantPost[0]?.body).toEqual({ role: 'OPERATOR' });
    await expect(page.getByTestId('users-role-revoke-OPERATOR')).toBeVisible({ timeout: 10_000 });
  });

  test('409 last_admin on revoke is explained inline', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      usersRevokeDeleteStatus: 409,
    });
    await seedHermeticSession(page);
    await openAccount(page);

    await page.getByTestId('users-role-revoke-CONSUMER').click();
    await page.getByTestId('users-role-confirm').click();
    await expect(page.getByTestId('users-role-error')).toContainText('last OPERATOR');
    expect(capture.usersRevokeDelete[0]?.path).toBe(
      `/admin/v1/users/${HERMETIC_CUSTOMER_ACCOUNT_ID}/roles/CONSUMER`,
    );
  });
});
