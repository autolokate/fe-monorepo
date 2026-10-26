import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_DD_DRAFT_ID,
  HERMETIC_DD_OTHER_CHANNEL_YOUTUBE,
  HERMETIC_DD_PUBLISHED_ID,
  installHermeticDailyDriveRoutes,
  openDailyDrivePage,
} from './helpers/hermetic-daily-drive';

/**
 * `/admin/v1/daily-drive/videos*` ships in BE eb2bd39; the table lands with migration 0087.
 * Hermetics mock HTTP — they do not prove the live oEmbed channel check.
 */
test.describe('Admin Daily Drive (hermetic)', () => {
  test('lists videos, adds a draft, publishes and archives with confirm', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const dd = await installHermeticDailyDriveRoutes(page);
    await seedHermeticSession(page);
    await openDailyDrivePage(page);

    await expect(page.getByText('Hermetic published video')).toBeVisible();
    await expect(page.getByText('Hermetic draft video')).toBeVisible();

    await page.getByRole('button', { name: 'Add video' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add Daily Drive video' });
    await dialog.getByTestId('daily-drive-youtube').fill('https://youtu.be/hermeticCC3');
    await dialog.getByTestId('daily-drive-category').selectOption('safety');
    await dialog.getByTestId('daily-drive-submit').click();

    await expect(page.getByRole('status')).toContainText(
      'Added "Hermetic YouTube title" as a draft.',
    );
    expect(dd.creates[0]?.body).toEqual({
      youtube: 'https://youtu.be/hermeticCC3',
      category: 'safety',
      sortOrder: 0,
      featured: false,
      publish: false,
    });

    await page.getByTestId(`daily-drive-publish-${HERMETIC_DD_DRAFT_ID}`).click();
    await expect.poll(() => dd.transitions.length).toBe(1);
    expect(dd.transitions[0]?.path).toBe(
      `/admin/v1/daily-drive/videos/${HERMETIC_DD_DRAFT_ID}/publish`,
    );

    await page.getByTestId(`daily-drive-archive-${HERMETIC_DD_PUBLISHED_ID}`).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Archive' }).click();
    await expect.poll(() => dd.transitions.length).toBe(2);
    expect(dd.transitions[1]?.path).toBe(
      `/admin/v1/daily-drive/videos/${HERMETIC_DD_PUBLISHED_ID}/archive`,
    );

    expect(base.unexpected).toEqual([]);
    expect(dd.unexpected).toEqual([]);
  });

  test('other-channel video shows the channel error inline', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticDailyDriveRoutes(page);
    await seedHermeticSession(page);
    await openDailyDrivePage(page);

    await page.getByRole('button', { name: 'Add video' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add Daily Drive video' });
    await dialog.getByTestId('daily-drive-youtube').fill(HERMETIC_DD_OTHER_CHANNEL_YOUTUBE);
    await dialog.getByTestId('daily-drive-submit').click();

    await expect(dialog.getByTestId('daily-drive-submit-error')).toContainText(
      'not from an approved channel',
    );
  });

  test('migration pending — names the 0087 gap instead of a generic error', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticDailyDriveRoutes(page, { listStatus: 503 });
    await seedHermeticSession(page);
    await page.goto('/discovery/daily-drive', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText(/migration 0087 pending/)).toBeVisible({ timeout: 30_000 });
  });
});
