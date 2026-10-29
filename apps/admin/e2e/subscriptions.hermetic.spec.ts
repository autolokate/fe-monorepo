import { expect, test } from '@playwright/test';

import {
  installHermeticApiRoutes,
  openSubscriptionsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin subscriptions list (Nest OA Present — CL-BE-13 / CL-FE-3).
 * Nest `activatedVia`: CONSUMER_SELF | PARTNER_ATTACH | PARTNER_PREPAID.
 */
test.describe('Subscriptions list (hermetic)', () => {
  test('list — Nest activatedVia CONSUMER_SELF', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openSubscriptionsPage(page);

    await expect(page.getByText('Consumer Self')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Shield', { exact: true }).first()).toBeVisible();
    expect(capture.subscriptionsGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });
});
