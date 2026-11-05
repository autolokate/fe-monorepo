import { expect, test } from '@playwright/test';

import {
  installHermeticApiRoutes,
  openOwnershipTransfersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * The lost-QR ownership transfer is retired (D-8 / BE-OWN-06): the page explains where ownership
 * moves now, offers no initiate / approve action, and the nav no longer links to it.
 * Stubbed HTTP only — never uses E2E_ADMIN_*, live OTP, or real ids.
 */
test.describe('Ownership transfer — retired (hermetic)', () => {
  test('old link lands on the retired notice with no write actions and no transfer calls', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipTransfersPage(page);

    await expect(page.getByTestId('ownership-transfers-retired')).toContainText(
      'approves it from Ownership claims',
    );
    await expect(page.getByRole('button', { name: 'Initiate transfer' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Approve transfer' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Ownership claims' }).first()).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Admin navigation' });
    await expect(nav.getByRole('link', { name: /Ownership transfers/ })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Ownership claims' })).toBeVisible();

    expect(capture.initiate).toHaveLength(0);
    expect(capture.approve).toHaveLength(0);
    expect(capture.unexpected).toEqual([]);
  });
});
