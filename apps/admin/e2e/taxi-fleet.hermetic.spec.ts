import { expect, test, type Page, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_FLEET_MEDIA_FRONT,
  HERMETIC_FLEET_VEHICLE_ID,
  hermeticBlockedFleetCard,
  hermeticFleetCard,
  hermeticFleetDetail,
} from './helpers/hermetic-taxi-v4';

const META = { requestId: 'req-hermetic', correlationId: 'corr-hermetic' };

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

type FleetCapture = { listQueries: string[]; removes: Array<{ path: string; body: unknown }> };

async function stubFleet(page: Page, options: { deployed?: boolean } = {}): Promise<FleetCapture> {
  const capture: FleetCapture = { listQueries: [], removes: [] };
  let removed = false;
  await page.route(/\/admin\/v1\/taxi\/vehicles/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    if (options.deployed === false) {
      await json(route, 404, { error: { code: 'not_found', message: `Cannot GET ${path}` } });
      return;
    }
    if (req.method() === 'GET' && path === '/admin/v1/taxi/vehicles') {
      capture.listQueries.push(url.search);
      const canBid = url.searchParams.get('canBid');
      const rows =
        canBid === 'false'
          ? [hermeticBlockedFleetCard()]
          : [hermeticFleetCard(), hermeticBlockedFleetCard()];
      await json(route, 200, {
        data: rows,
        meta: {
          ...META,
          pagination: { limit: 25, cursor: null, nextCursor: null, hasMore: false },
        },
      });
      return;
    }
    if (req.method() === 'GET' && path === `/admin/v1/taxi/vehicles/${HERMETIC_FLEET_VEHICLE_ID}`) {
      await json(route, 200, { data: hermeticFleetDetail({ frontRemoved: removed }), meta: META });
      return;
    }
    if (
      req.method() === 'POST' &&
      path ===
        `/admin/v1/taxi/vehicles/${HERMETIC_FLEET_VEHICLE_ID}/media/${HERMETIC_FLEET_MEDIA_FRONT}/remove`
    ) {
      capture.removes.push({ path, body: req.postDataJSON() as unknown });
      removed = true;
      await json(route, 200, { data: hermeticFleetDetail({ frontRemoved: true }), meta: META });
      return;
    }
    await json(route, 404, {
      error: { code: 'not_found', message: `Cannot ${req.method()} ${path}` },
    });
  });
  return capture;
}

test.describe('Taxi fleet & media (hermetic)', () => {
  test('list filters, detail drawer with driver + media, remove media with a reason', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await stubFleet(page);
    await seedHermeticSession(page);

    await page.goto('/taxi/fleet');
    await expect(page.getByRole('heading', { name: 'Taxi fleet' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('KA01HM0001')).toBeVisible();
    await expect(page.getByText('RC not approved')).toBeVisible();

    await page.getByRole('group', { name: 'Can bid' }).getByTestId('filter-chip-NO').click();
    await expect.poll(() => capture.listQueries.at(-1)).toContain('canBid=false');
    await expect(page).toHaveURL(/canBid=NO/);
    await expect(page.getByText('KA01HM0001')).toBeHidden();

    await page.getByRole('group', { name: 'Can bid' }).getByTestId('filter-chip-ALL').click();
    await page.getByText('KA01HM0001').click();
    const drawer = page.getByTestId('taxi-fleet-drawer');
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`vehicle=${HERMETIC_FLEET_VEHICLE_ID}`));
    await expect(drawer.getByTestId('taxi-driver-identity')).toContainText('Hermetic Driver');
    await expect(drawer.getByTestId('taxi-fleet-media-FRONT').locator('img')).toBeVisible();
    await expect(drawer.getByTestId('taxi-fleet-media-REAR')).toContainText('Bytes gone');
    await expect(drawer.getByTestId('taxi-fleet-media-VIDEO').locator('video')).toHaveCount(1);
    await expect(drawer).toContainText('Signed links expire 300 s');

    await drawer.getByTestId('taxi-fleet-media-remove-FRONT').click();
    await expect(page.getByTestId('taxi-fleet-media-remove-confirm')).toBeDisabled();
    await page
      .getByTestId('taxi-fleet-media-remove-reason')
      .fill('Licence plate of a customer visible');
    await page.getByTestId('taxi-fleet-media-remove-confirm').click();
    await expect.poll(() => capture.removes.length).toBe(1);
    expect(capture.removes[0]?.body).toEqual({ reason: 'Licence plate of a customer visible' });
    await expect(drawer.getByTestId('taxi-fleet-media-FRONT')).toHaveCount(0);
    await expect(drawer.getByTestId('taxi-fleet-slot-FRONT')).toContainText('No live media');
    await expect(drawer.getByTestId('taxi-fleet-blockers')).toContainText('Media missing');
    expect(base.unexpected).toEqual([]);
  });

  test('a server without the fleet route shows the not-deployed state', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await stubFleet(page, { deployed: false });
    await seedHermeticSession(page);
    await page.goto('/taxi/fleet');
    await expect(page.getByTestId('admin-not-deployed')).toContainText(
      'GET /admin/v1/taxi/vehicles',
      { timeout: 30_000 },
    );
  });
});
