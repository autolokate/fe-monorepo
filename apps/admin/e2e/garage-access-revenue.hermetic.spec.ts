import { expect, test, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { installHermeticPartnersRoutes, openPartnerDetailPage } from './helpers/hermetic-partners';
import { hermeticGarageRevenueRow } from './helpers/hermetic-taxi-v4';

const META = { requestId: 'req-hermetic', correlationId: 'corr-hermetic' };

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

test.describe('Garage access + pass revenue (hermetic)', () => {
  test('partner detail shows weekly free bids, active pass state and pass history', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const partners = await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnerDetailPage(page);

    const access = page.getByTestId('partners-garage-access');
    await expect(access).toContainText('On weekly free bids');
    await expect(access).toContainText('1 used of 5');
    await expect(access).toContainText('Remaining');
    const passes = page.getByTestId('partners-garage-passes');
    await expect(passes).toContainText('24-hour pass');
    await expect(passes).toContainText('pay_hermetic_pass_1 · INV-HERM-1');
    expect(base.unexpected).toEqual([]);
    expect(partners.unexpected).toEqual([]);
  });

  test('taxi-only partner has no garage access panel', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnerDetailPage(page, 'aaaaaaaa-0000-4000-8000-0000000000ab');
    await expect(page.getByTestId('partners-garage-access')).toHaveCount(0);
  });

  test('revenue page: date + org filters go to the server; loaded-rows total is labelled', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const queries: string[] = [];
    await page.route(/\/admin\/v1\/garage\/revenue/, async (route) => {
      const url = new URL(route.request().url());
      queries.push(url.search);
      await json(route, 200, {
        data: [
          hermeticGarageRevenueRow(),
          hermeticGarageRevenueRow({
            id: 'aaaaaaaa-0000-4000-8000-0000000000c9',
            kind: 'MONTH_PASS',
            amountPaise: 49900,
            paymentRef: 'pay_hermetic_pass_2',
          }),
        ],
        meta: {
          ...META,
          pagination: { limit: 50, cursor: null, nextCursor: null, hasMore: false },
        },
      });
    });
    await seedHermeticSession(page);

    await page.goto('/garage/revenue');
    await expect(page.getByRole('heading', { name: 'Garage pass revenue' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('pay_hermetic_pass_2')).toBeVisible();
    await expect(page.getByTestId('garage-revenue-total')).toContainText('₹598');
    await expect(page.getByTestId('garage-revenue-total')).toContainText('on loaded rows');
    await expect(page.getByTestId('garage-revenue-total')).toContainText('GST is not snapshotted');

    await page.getByTestId('garage-revenue-from').fill('2026-11-01');
    await page.getByTestId('garage-revenue-to').fill('2026-11-02');
    await expect.poll(() => queries.at(-1) ?? '').toContain('to=');
    const last = new URLSearchParams(queries.at(-1));
    expect(
      new Date(last.get('to') ?? '').getTime() - new Date(last.get('from') ?? '').getTime(),
    ).toBe(2 * 24 * 3600 * 1000);
    await expect(page).toHaveURL(/from=2026-11-01/);

    await page.getByTestId('garage-revenue-org').fill('aaaaaaaa-0000-4000-8000-0000000000aa');
    await expect
      .poll(() => queries.at(-1) ?? '')
      .toContain('orgId=aaaaaaaa-0000-4000-8000-0000000000aa');
    expect(base.unexpected).toEqual([]);
  });
});
