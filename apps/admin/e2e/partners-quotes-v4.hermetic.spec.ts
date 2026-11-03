import { expect, test, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_TAXI_REQUEST_ID,
  installHermeticPartnersRoutes,
  openPartnersRequestsPage,
} from './helpers/hermetic-partners';

const META = { requestId: 'req-hermetic', correlationId: 'corr-hermetic' };

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

test.describe('Requests & bids — quotes v4 + taxi ops (hermetic)', () => {
  test('garage detail shows vehicle name, place, customer photos and the source clip', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const partners = await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);
    await openPartnersRequestsPage(page);

    await expect(page.getByText('Hyundai Creta').first()).toBeVisible();
    await expect(page.getByText('Service · 1 photo · from a clip')).toBeVisible();
    await page.getByText('Hermetic garage request').click();
    const detail = page.getByTestId('partners-request-detail');
    await expect(detail).toContainText('MH12••34');
    await expect(detail).toContainText('Hermetic Motors, Kothrud, Pune');
    await expect(page.getByTestId('partners-request-photos').locator('img')).toHaveCount(1);
    await expect(page.getByTestId('partners-source-clip')).toContainText(
      'Hermetic brake squeal fix',
    );
    await expect(page.getByTestId('partners-source-clip')).toContainText('Garage');
    expect(base.unexpected).toEqual([]);
    expect(partners.unexpected).toEqual([]);
  });

  test('taxi: region/date filters, driver identity on bids, admin close with reason', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const partners = await installHermeticPartnersRoutes(page);
    const closes: unknown[] = [];
    let closeStatus = 409;
    await page.route(/\/admin\/v1\/taxi\/requests\/[^/]+\/close$/, async (route) => {
      closes.push(route.request().postDataJSON() as unknown);
      if (closeStatus === 409) {
        closeStatus = 200;
        await json(route, 409, {
          error: { code: 'taxi_request_not_open', message: 'Request is not open' },
        });
        return;
      }
      await json(route, 200, {
        data: {
          id: HERMETIC_TAXI_REQUEST_ID,
          status: 'EXPIRED',
          pickupLabel: 'Kothrud, Pune',
          dropoffLabel: 'Airport',
          bids: [],
        },
        meta: META,
      });
    });
    await seedHermeticSession(page);
    await openPartnersRequestsPage(page);
    await page.getByTestId('filter-chip-taxi').click();
    await expect(page.getByText('Kothrud, Pune')).toBeVisible();

    await page.getByTestId('taxi-filter-city').fill('Pune');
    await page.getByTestId('taxi-filter-state').fill('Maharashtra');
    await page.getByTestId('taxi-filter-from').fill('2026-10-01');
    await expect
      .poll(() => {
        const q = new URLSearchParams(partners.taxiRequestsList.at(-1)?.query ?? '');
        return [q.get('pickupCity'), q.get('pickupState'), Boolean(q.get('from'))].join('|');
      })
      .toBe('Pune|Maharashtra|true');
    await expect(page).toHaveURL(/taxiCity=Pune/);

    await page.getByText('Kothrud, Pune').click();
    await expect(page.getByTestId('partners-source-clip')).toBeVisible();
    const bids = page.getByTestId('partners-bids-panel');
    await expect(bids).toContainText('Hermetic Driver');
    await expect(bids).toContainText('current driver of the bid vehicle');

    await page.getByTestId('taxi-request-close').click();
    await expect(page.getByTestId('taxi-request-close-confirm')).toBeDisabled();
    await page.getByTestId('taxi-request-close-reason').fill('Spam request from a test account');
    await page.getByTestId('taxi-request-close-confirm').click();
    await expect(page.getByTestId('taxi-request-close-error')).toContainText('no longer open');
    await page.getByTestId('taxi-request-close-confirm').click();
    await expect.poll(() => closes.length).toBe(2);
    expect(closes[0]).toEqual({ reason: 'Spam request from a test account' });
    await expect(page.getByTestId('taxi-request-close')).toHaveCount(0);
    expect(base.unexpected).toEqual([]);
  });

  test('taxi: an unknown city answers 400 and the server message shows inline', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticPartnersRoutes(page);
    await page.route(/\/admin\/v1\/taxi\/requests\?.*pickupCity=Atlantis/, async (route) => {
      await json(route, 400, {
        error: { code: 'validation', message: 'Unknown pickupCity "Atlantis".' },
      });
    });
    await seedHermeticSession(page);
    await openPartnersRequestsPage(page);
    await page.getByTestId('filter-chip-taxi').click();
    await page.getByTestId('taxi-filter-city').fill('Atlantis');
    await expect(page.getByTestId('taxi-filter-error')).toContainText('Unknown pickupCity');
    await expect(page.getByTestId('taxi-filter-city')).toBeVisible();
  });
});
