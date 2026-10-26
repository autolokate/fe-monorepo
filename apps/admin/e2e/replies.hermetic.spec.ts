import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_REPLY_HIDDEN_ID,
  HERMETIC_REPLY_VISIBLE_ID,
  installHermeticRepliesRoutes,
  openRepliesPage,
} from './helpers/hermetic-replies';

/** `GET/PATCH /admin/v1/community/replies*` — hermetic HTTP; the live audit trail is BE-tested. */
test.describe('Admin Q&A replies moderation (hermetic)', () => {
  test('defaults to published replies; hide asks to confirm, restore is direct', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const replies = await installHermeticRepliesRoutes(page);
    await seedHermeticSession(page);
    await openRepliesPage(page);

    await expect(page.getByText('Hermetic visible reply about pads')).toBeVisible();
    await expect(page.getByText('On: Hermetic brake squeal question').first()).toBeVisible();
    await expect(page.getByText('Hermetic hidden reply with spam')).toHaveCount(0);
    expect(replies.listGets[0]).toContain('status=VISIBLE');

    await page.getByTestId(`reply-hide-${HERMETIC_REPLY_VISIBLE_ID}`).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Hide' }).click();
    await expect.poll(() => replies.patches.length).toBe(1);
    expect(replies.patches[0]).toMatchObject({
      path: `/admin/v1/community/replies/${HERMETIC_REPLY_VISIBLE_ID}`,
      body: { status: 'HIDDEN' },
    });
    await expect(page.getByText('Reply hidden from the consumer app.')).toBeVisible();

    await page
      .getByRole('group', { name: 'Reply status' })
      .getByRole('button', { name: 'Hidden' })
      .click();
    await page.getByTestId(`reply-restore-${HERMETIC_REPLY_HIDDEN_ID}`).click();
    await expect.poll(() => replies.patches.length).toBe(2);
    expect(replies.patches[1]?.body).toEqual({ status: 'VISIBLE' });

    expect(base.unexpected).toEqual([]);
    expect(replies.unexpected).toEqual([]);
  });

  test('migration pending — names the 0087 gap', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticRepliesRoutes(page, { listStatus: 503 });
    await seedHermeticSession(page);
    await page.goto('/discovery/replies', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText(/migration 0087 pending/)).toBeVisible({ timeout: 30_000 });
  });
});
