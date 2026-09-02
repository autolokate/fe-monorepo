import { expect, test } from '@playwright/test';

import { loginAsAdmin } from './helpers/auth';
import { pauseIfWatching, showState } from './helpers/watch';

/**
 * Admin role console: find an account by phone → grant ADMIN → revoke ADMIN.
 *
 * The target is looked up through the phone blind index, so the number never leaves the server
 * decrypted. Revoke succeeds only because another ADMIN survives — the `last_admin` guard is
 * covered in the API's own e2e (`admin-roles.e2e-spec.ts`), not here.
 */
test.describe('Users & Roles', () => {
  test('grant then revoke ADMIN on a real account', async ({ page }) => {
    const phone = process.env.E2E_TARGET_PHONE ?? '+919876543210';

    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'Users & Roles' }).click();
    await expect(page.getByRole('heading', { name: 'Users & Roles' })).toBeVisible();
    await showState(page, '1 · Users & Roles');

    await page.getByLabel('Phone number').fill(phone);
    await page.getByRole('button', { name: 'Find account' }).click();

    const account = page.getByRole('region', { name: 'Account roles' });
    await expect(account).toBeVisible({ timeout: 15_000 });
    await expect(account.getByText('CONSUMER')).toBeVisible();
    await showState(page, '2 · account resolved by blind index');

    await page.getByRole('button', { name: 'Grant ADMIN' }).click();
    const grantConfirm = page.getByRole('alertdialog', { name: 'Grant ADMIN' });
    await expect(grantConfirm).toBeVisible();
    await grantConfirm.getByRole('button', { name: 'Grant ADMIN' }).click();

    await expect(account.getByText('ADMIN', { exact: true })).toBeVisible({ timeout: 15_000 });
    await showState(page, '3 · ADMIN granted');

    await page.getByRole('button', { name: 'Revoke ADMIN' }).click();
    const revokeConfirm = page.getByRole('alertdialog', { name: 'Revoke ADMIN' });
    await expect(revokeConfirm).toBeVisible();
    await revokeConfirm.getByRole('button', { name: 'Revoke ADMIN' }).click();

    await expect(account.getByText('ADMIN', { exact: true })).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Grant ADMIN' })).toBeVisible();
    await showState(page, '4 · ADMIN revoked');

    await pauseIfWatching(page);
  });

  test('reports a phone with no account', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');

    await page.getByLabel('Phone number').fill('+919000000123');
    await page.getByRole('button', { name: 'Find account' }).click();

    await expect(page.getByRole('alert')).toContainText('No account is registered');
    await expect(page.getByRole('region', { name: 'Account roles' })).toBeHidden();
  });
});
