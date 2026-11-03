import { expect, test, type Page } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { installUsersV4Routes, V4_BROADCAST_ID } from './helpers/hermetic-users-v4';

const A = 'a0969716-07f9-4519-87fc-f67789b7527d';
const B = '36ad9954-602d-4761-916f-eb09b5223d17';

async function fillDraft(page: Page) {
  await page.goto('/notifications/broadcast');
  await expect(page.getByRole('heading', { name: 'System broadcast' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByTestId('filter-chip-PARTNER').click();
  await page.getByTestId('broadcast-account-ids').fill(`${A}\n${B}, ${A.toUpperCase()}`);
  await page.getByTestId('broadcast-title').fill('Planned maintenance');
  await page.getByTestId('broadcast-body').fill('Partner app downtime tonight 11pm–11:10pm.');
  await page.getByTestId('broadcast-deep-link').selectOption('PartnerGaragePasses');
  await page.getByTestId('broadcast-reason').fill('Notify affected garages');
}

/** SYSTEM broadcast composer — validate, confirm, 202 result; 429 keeps the draft. */
test.describe('System broadcast (hermetic)', () => {
  test('validates, previews, confirms and sends the de-duplicated body', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);

    await page.goto('/notifications/broadcast');
    await page.getByTestId('broadcast-review').click({ timeout: 30_000 });
    await expect(page.getByText('Add at least one account ID.')).toBeVisible();
    expect(capture.broadcast).toEqual([]);

    await fillDraft(page);
    await expect(page.getByTestId('broadcast-preview')).toContainText('Planned maintenance');
    await expect(page.getByText('2 accounts · 1 duplicate(s) removed')).toBeVisible();

    await page.getByTestId('broadcast-review').click();
    await expect(page.getByTestId('broadcast-summary')).toContainText('Partner app');
    await page.getByTestId('broadcast-confirm').click();

    await expect.poll(() => capture.broadcast.length).toBe(1);
    expect(capture.broadcast[0]).toEqual({
      audience: 'PARTNER',
      accountIds: [A, B],
      title: 'Planned maintenance',
      body: 'Partner app downtime tonight 11pm–11:10pm.',
      deepLink: { screen: 'PartnerGaragePasses' },
      reason: 'Notify affected garages',
    });
    await expect(page.getByTestId('broadcast-result')).toContainText(V4_BROADCAST_ID);
    await expect(page.getByTestId('broadcast-result')).toContainText('Skipped');
  });

  test('429 rate_limited explains the hourly limit and keeps the draft', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page, { broadcastStatus: 429 });
    await seedHermeticSession(page);

    await fillDraft(page);
    await page.getByTestId('broadcast-review').click();
    await page.getByTestId('broadcast-confirm').click();
    await expect(page.getByTestId('broadcast-error')).toContainText('10 broadcasts per hour');
    await expect(page.getByTestId('broadcast-title')).toHaveValue('Planned maintenance');
  });
});
