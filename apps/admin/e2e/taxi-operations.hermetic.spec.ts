import { expect, test, type Page, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const BOOKING_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7001';
const ORG_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7002';

const BOOKING = {
  id: BOOKING_ID,
  requestId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7003',
  orgId: ORG_ID,
  orgName: 'Hermetic Cabs',
  status: 'CONFIRMED',
  selectedFareRupees: 2400,
  pickupLabel: 'Hermetic Pickup',
  dropoffLabel: 'Hermetic Drop',
  pickupAt: '2026-11-05T09:00:00.000Z',
  customerAdvance: { status: 'HELD', amountPaise: 12000, bps: 500 },
  partnerDeposit: { status: 'NONE', amountPaise: null, bps: 700 },
  createdAt: '2026-11-01T09:00:00.000Z',
};

const BOOKING_DETAIL = {
  ...BOOKING,
  checkouts: [
    {
      id: 'chk-1',
      kind: 'CUSTOMER_ADVANCE',
      status: 'PAID',
      amountPaise: 12000,
      paymentRef: 'pay_hermetic_taxi_1',
      createdAt: '2026-11-01T09:05:00.000Z',
    },
  ],
  refunds: [],
};

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

type TaxiOpsCapture = {
  cancel: unknown[];
  suspend: unknown[];
  reinstate: number;
};

async function stubTaxiOps(page: Page, options: { deployed: boolean }): Promise<TaxiOpsCapture> {
  const capture: TaxiOpsCapture = { cancel: [], suspend: [], reinstate: 0 };
  let enrollmentStatus = 'ACTIVE';
  await page.route(/\/admin\/v1\/taxi\/(bookings|enrollments)/, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();
    if (!options.deployed) {
      await json(route, 404, {
        error: { code: 'not_found', message: `Cannot ${method} ${path}` },
      });
      return;
    }
    if (method === 'GET' && path === '/admin/v1/taxi/bookings') {
      await json(route, 200, { data: { items: [BOOKING], nextCursor: null } });
      return;
    }
    if (method === 'GET' && path === `/admin/v1/taxi/bookings/${BOOKING_ID}`) {
      await json(route, 200, { data: BOOKING_DETAIL });
      return;
    }
    if (method === 'POST' && path === `/admin/v1/taxi/bookings/${BOOKING_ID}/cancel`) {
      capture.cancel.push({
        body: req.postDataJSON() as unknown,
        idempotencyKey: req.headers()['idempotency-key'] ?? null,
      });
      await json(route, 200, { data: { ...BOOKING_DETAIL, status: 'CANCELLED_PARTNER' } });
      return;
    }
    if (method === 'GET' && path === '/admin/v1/taxi/enrollments') {
      await json(route, 200, {
        data: { items: [{ orgId: ORG_ID, orgName: 'Hermetic Cabs', status: enrollmentStatus }] },
      });
      return;
    }
    if (method === 'POST' && path === `/admin/v1/taxi/enrollments/${ORG_ID}/suspend`) {
      capture.suspend.push(req.postDataJSON() as unknown);
      enrollmentStatus = 'SUSPENDED';
      await json(route, 200, { data: { orgId: ORG_ID, status: 'SUSPENDED' } });
      return;
    }
    if (method === 'POST' && path === `/admin/v1/taxi/enrollments/${ORG_ID}/reinstate`) {
      capture.reinstate += 1;
      enrollmentStatus = 'ACTIVE';
      await json(route, 200, { data: { orgId: ORG_ID, status: 'ACTIVE' } });
      return;
    }
    await json(route, 404, { error: { code: 'not_found', message: `Cannot ${method} ${path}` } });
  });
  return capture;
}

/** ADM-06 — Taxi bookings / enrollments against the CONTRACTS.md admin routes (stubbed). */
test.describe('Taxi operations (hermetic)', () => {
  test('bookings list → detail shows server money, checkouts; cancel with refund', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await stubTaxiOps(page, { deployed: true });
    await seedHermeticSession(page);

    await page.goto('/taxi/bookings');
    await expect(page.getByRole('heading', { name: 'Taxi bookings' })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByText('Hermetic Pickup → Hermetic Drop').click();

    await expect(page.getByText('Held · ₹120 · 5%')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('taxi-booking-checkouts')).toContainText('pay_hermetic_taxi_1');
    // Deposit is not held → release is disabled with a reason.
    await expect(page.getByTestId('taxi-booking-release-deposit')).toBeDisabled();

    await page.getByTestId('taxi-booking-cancel').click();
    await page.getByTestId('taxi-booking-cancel-reason').fill('Partner vehicle breakdown');
    await page.getByTestId('taxi-booking-cancel-confirm').click();
    await expect.poll(() => capture.cancel.length).toBe(1);
    expect(capture.cancel[0]).toMatchObject({
      body: { reason: 'Partner vehicle breakdown', refundAdvance: true },
    });
    expect((capture.cancel[0] as { idempotencyKey: string | null }).idempotencyKey).toBeTruthy();
  });

  test('enrollments — suspend requires a reason, then reinstate', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await stubTaxiOps(page, { deployed: true });
    await seedHermeticSession(page);

    await page.goto('/taxi/partners');
    await page.getByTestId(`taxi-enrollment-suspend-${ORG_ID}`).click({ timeout: 30_000 });
    await expect(page.getByTestId('taxi-enrollment-confirm')).toBeDisabled();
    await page.getByTestId('taxi-enrollment-reason').fill('KYC lapsed');
    await page.getByTestId('taxi-enrollment-confirm').click();
    await expect.poll(() => capture.suspend).toEqual([{ reason: 'KYC lapsed' }]);

    await page.getByTestId(`taxi-enrollment-reinstate-${ORG_ID}`).click({ timeout: 15_000 });
    await page.getByTestId('taxi-enrollment-confirm').click();
    await expect.poll(() => capture.reinstate).toBe(1);
  });

  test('server without the routes → honest not-deployed state, no rows', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await stubTaxiOps(page, { deployed: false });
    await seedHermeticSession(page);

    await page.goto('/taxi/bookings');
    await expect(page.getByTestId('admin-not-deployed')).toContainText(
      'GET /admin/v1/taxi/bookings',
      { timeout: 30_000 },
    );
    await page.goto('/taxi/partners');
    await expect(page.getByTestId('admin-not-deployed')).toContainText(
      'GET /admin/v1/taxi/enrollments',
      { timeout: 30_000 },
    );
  });
});
