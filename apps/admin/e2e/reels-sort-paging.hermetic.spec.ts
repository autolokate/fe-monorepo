import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const NOW = '2026-10-20T00:00:00.000Z';

function reel(n: number) {
  return {
    reelId: `aaaaaaaa-0000-4000-8000-${String(9000 + n).padStart(12, '0')}`,
    stableKey: `paging-${String(n)}`,
    title: `Paging reel ${String(n)}`,
    caption: '',
    status: 'PUBLISHED',
    videoMediaId: 'aaaaaaaa-0000-4000-8000-000000000999',
    thumbMediaId: null,
    playbackUrl: null,
    thumbUrl: null,
    sortOrder: n,
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
    viewCount: 0,
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

/**
 * The backend reel cursor is (updatedAt, id) for every sort, so Load more is only offered for
 * "Recently updated"; other sorts say how to reach the rest instead of skipping/repeating rows.
 */
test('reels Load more follows the cursor only in Recently updated order', async ({ page }) => {
  await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  const queries: string[] = [];
  await page.route('**/admin/v1/community/reels?**', async (route) => {
    const url = new URL(route.request().url());
    queries.push(url.search);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [reel(1), reel(2)],
        meta: {
          requestId: 'r',
          correlationId: 'c',
          pagination: { limit: 100, cursor: null, nextCursor: 'next', hasMore: true },
        },
      }),
    });
  });
  await seedHermeticSession(page);
  await page.goto('/discovery/reels');

  await expect(page.getByText('Paging reel 1')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('discovery-reels-load-more')).toBeVisible();
  await expect(page.getByTestId('discovery-reels-sort-paging-note')).toHaveCount(0);

  await page.getByLabel('Reel sort').selectOption('likes');
  await expect.poll(() => queries.some((q) => q.includes('sort=likes'))).toBe(true);
  await expect(page.getByTestId('discovery-reels-sort-paging-note')).toBeVisible();
  await expect(page.getByTestId('discovery-reels-load-more')).toHaveCount(0);
});
