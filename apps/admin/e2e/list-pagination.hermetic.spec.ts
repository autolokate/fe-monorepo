import { expect, test, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const META = { requestId: 'r', correlationId: 'c' };

function order(n: number) {
  return {
    orderId: `${String(n).padStart(8, '0')}-0000-4000-8000-000000000101`,
    // Nest admin orders carry no order number — the row shows the short order id.
    orderNumber: null,
    accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
    orderKind: 'SCAN_SELF_PAY',
    status: 'PAID',
    planName: 'Hermetic Plan',
    planVersion: 1,
    riderCount: 1,
    totalPaise: 9900,
    createdAt: '2026-10-18T00:00:00.000Z',
    fulfillment: null,
  };
}

async function fulfillPage(route: Route, items: unknown[], nextCursor: string | null) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: items,
      meta: {
        ...META,
        pagination: { limit: 50, cursor: null, nextCursor, hasMore: Boolean(nextCursor) },
      },
    }),
  });
}

/** Keyset lists follow `meta.pagination.nextCursor` instead of silently stopping at the first page. */
test('orders list loads the next page from nextCursor', async ({ page }) => {
  await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  const queries: string[] = [];
  await page.route('**/admin/v1/orders?**', async (route) => {
    const url = new URL(route.request().url());
    queries.push(url.search);
    if (url.searchParams.get('cursor') === 'page-2') {
      await fulfillPage(route, [order(3)], null);
      return;
    }
    await fulfillPage(route, [order(1), order(2)], 'page-2');
  });
  await seedHermeticSession(page);
  await page.goto('/orders');

  await expect(page.getByText('00000001', { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('00000003', { exact: true })).toHaveCount(0);
  await page.getByTestId('orders-load-more').click();
  await expect(page.getByText('00000003', { exact: true })).toBeVisible();
  await expect(page.getByTestId('orders-load-more')).toHaveCount(0);
  expect(queries[0]).toContain('limit=50');
  expect(queries.at(-1)).toContain('cursor=page-2');
});
