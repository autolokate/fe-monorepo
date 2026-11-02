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
 * The backend reel cursor now encodes its sort (a cross-sort cursor is a 400), so Load more works
 * in every sort order, and changing the sort starts over without a cursor.
 */
test('reels Load more follows the cursor in every sort; a sort change resets the cursor', async ({
  page,
}) => {
  await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  const queries: string[] = [];
  await page.route('**/admin/v1/community/reels?**', async (route) => {
    const url = new URL(route.request().url());
    queries.push(url.search);
    const sort = url.searchParams.get('sort') ?? 'updated';
    const cursor = url.searchParams.get('cursor');
    if (cursor && cursor !== `next-${sort}`) {
      // Nest rejects a cursor issued under another sort.
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'validation', message: 'cursor does not match sort' },
        }),
      });
      return;
    }
    const items = cursor ? [reel(3)] : [reel(1), reel(2)];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: items,
        meta: {
          requestId: 'r',
          correlationId: 'c',
          pagination: {
            limit: 100,
            cursor,
            nextCursor: cursor ? null : `next-${sort}`,
            hasMore: !cursor,
          },
        },
      }),
    });
  });
  await seedHermeticSession(page);
  await page.goto('/discovery/reels');

  await expect(page.getByText('Paging reel 1')).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('discovery-reels-load-more').click();
  await expect(page.getByText('Paging reel 3')).toBeVisible();
  await expect(page.getByTestId('discovery-reels-load-more')).toHaveCount(0);
  expect(queries.at(-1)).toContain('cursor=next-updated');

  await page.getByLabel('Reel sort').selectOption('likes');
  await expect.poll(() => queries.some((q) => q.includes('sort=likes'))).toBe(true);
  // The first page under the new sort carries no cursor (the old one would be a 400).
  const firstLikes = queries.find((q) => q.includes('sort=likes'));
  expect(firstLikes).not.toContain('cursor=');
  await expect(page.getByText('Paging reel 3')).toHaveCount(0);
  await page.getByTestId('discovery-reels-load-more').click();
  await expect(page.getByText('Paging reel 3')).toBeVisible();
  expect(queries.at(-1)).toContain('sort=likes');
  expect(queries.at(-1)).toContain('cursor=next-likes');
});
