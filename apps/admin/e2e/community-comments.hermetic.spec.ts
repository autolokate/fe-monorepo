import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_COMMENT_HIDDEN_ID,
  HERMETIC_COMMENT_ID,
  HERMETIC_COMMENT_REEL_ID,
  installHermeticCommentsRoutes,
} from './helpers/hermetic-content-v4';

test.describe('Comment moderation (hermetic)', () => {
  test('lists comments with mentions; hide requires a reason, restore sends none', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installHermeticCommentsRoutes(page);
    await seedHermeticSession(page);

    await page.goto('/discovery/comments');
    await expect(page.getByRole('heading', { name: 'Comments', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('Hermetic brake pad swap').first()).toBeVisible();
    await expect(page.locator('.discovery-mention').first()).toHaveText('@hermetic.garage');
    await expect(page.getByText('↳ Reply')).toBeVisible();

    // Hide — reason is required.
    await page.getByTestId(`comment-hide-${HERMETIC_COMMENT_ID}`).click();
    await expect(page.getByTestId('comment-moderation-confirm')).toBeDisabled();
    await page.getByTestId('comment-moderation-reason').fill('Spam link');
    await page.getByTestId('comment-moderation-confirm').click();
    await expect.poll(() => capture.patches.length).toBe(1);
    expect(capture.patches[0]).toEqual({
      id: HERMETIC_COMMENT_ID,
      body: { status: 'HIDDEN', reason: 'Spam link' },
    });
    await expect(page.getByTestId(`comment-restore-${HERMETIC_COMMENT_ID}`)).toBeVisible();

    // Restore — optional reason left blank → no reason sent.
    await page.getByTestId(`comment-restore-${HERMETIC_COMMENT_HIDDEN_ID}`).click();
    await expect(page.getByTestId('comment-moderation-confirm')).toBeEnabled();
    await page.getByTestId('comment-moderation-confirm').click();
    await expect.poll(() => capture.patches.length).toBe(2);
    expect(capture.patches[1]).toEqual({
      id: HERMETIC_COMMENT_HIDDEN_ID,
      body: { status: 'VISIBLE' },
    });
    expect(base.unexpected).toEqual([]);
  });

  test('filters live in the URL and reach the API', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installHermeticCommentsRoutes(page);
    await seedHermeticSession(page);

    await page.goto(`/discovery/comments?status=HIDDEN&reelId=${HERMETIC_COMMENT_REEL_ID}`);
    await expect(page.getByTestId('filter-chip-HIDDEN')).toHaveAttribute('aria-pressed', 'true', {
      timeout: 30_000,
    });
    await expect
      .poll(() =>
        capture.listQueries.some(
          (q) => q.get('status') === 'HIDDEN' && q.get('reelId') === HERMETIC_COMMENT_REEL_ID,
        ),
      )
      .toBe(true);
    await page.getByRole('searchbox', { name: 'Search comments' }).fill('followers');
    await expect.poll(() => capture.listQueries.some((q) => q.get('q') === 'followers')).toBe(true);
    await expect(page).toHaveURL(/q=followers/);
  });

  test('not deployed → honest state, no rows', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticCommentsRoutes(page, { listStatus: 404 });
    await seedHermeticSession(page);
    await page.goto('/discovery/comments');
    await expect(page.getByTestId('admin-not-deployed')).toContainText(
      'GET /admin/v1/community/comments',
      { timeout: 30_000 },
    );
  });
});
