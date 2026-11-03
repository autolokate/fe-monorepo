import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const ORG_ID = 'b1b1b1b1-0000-4000-8000-0000000000aa';
const NOW = '2026-11-02T00:00:00.000Z';

/** The Reels list can be narrowed to Autolokate reels or partner (garage / store) clips. */
test('reels creator filter and partner org filter reach the API and persist in the URL', async ({
  page,
}) => {
  await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  const queries: URLSearchParams[] = [];
  await page.route('**/admin/v1/community/reels?**', async (route) => {
    const url = new URL(route.request().url());
    queries.push(url.searchParams);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            reelId: 'b1b1b1b1-0000-4000-8000-000000000001',
            stableKey: 'garage-clip-1',
            title: 'Hermetic garage clip',
            caption: '',
            status: 'PUBLISHED',
            videoMediaId: 'b1b1b1b1-0000-4000-8000-000000000999',
            thumbMediaId: null,
            sortOrder: 1,
            likeCount: 0,
            commentCount: 0,
            bookmarkCount: 0,
            viewCount: 0,
            publishedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
          },
        ],
        meta: {
          requestId: 'r',
          correlationId: 'c',
          pagination: { limit: 100, cursor: null, nextCursor: null, hasMore: false },
        },
      }),
    });
  });
  await seedHermeticSession(page);

  await page.goto('/discovery/reels');
  await expect(page.getByText('Hermetic garage clip')).toBeVisible({ timeout: 30_000 });

  await page.getByTestId('filter-chip-GARAGE').click();
  await expect(page).toHaveURL(/creator=GARAGE/);
  await expect.poll(() => queries.some((q) => q.get('creatorKind') === 'GARAGE')).toBe(true);

  await page.getByRole('searchbox', { name: 'Filter reels by partner org id' }).fill(ORG_ID);
  await expect
    .poll(() =>
      queries.some((q) => q.get('creatorKind') === 'GARAGE' && q.get('partnerOrgId') === ORG_ID),
    )
    .toBe(true);

  await page.reload();
  await expect(page.getByTestId('filter-chip-GARAGE')).toHaveAttribute('aria-pressed', 'true', {
    timeout: 30_000,
  });
});
