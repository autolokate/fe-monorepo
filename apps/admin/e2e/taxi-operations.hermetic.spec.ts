import { expect, test, type Page, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const BOOKING_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7001';
const ORG_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7002';

/** OpenAPI `AdminTaxiBookingDto` (flat money-side statuses; amounts live on checkouts). */
const BOOKING = {
  id: BOOKING_ID,
  requestId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7003',
  bidId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7004',
  orgId: ORG_ID,
  accountId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7005',
  vehicleId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7006',
  driverAccountId: null,
  status: 'CONFIRMED',
  selectedFareRupees: 2400,
  currency: 'INR',
  customerAdvanceStatus: 'HELD',
  partnerDepositStatus: 'NONE',
  contactUnlocked: true,
  pickupLabel: 'Hermetic Pickup',
  dropoffLabel: 'Hermetic Drop',
  pickupAt: '2026-11-05T09:00:00.000Z',
  selectedAt: '2026-11-01T09:00:00.000Z',
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  cancelledBy: null,
  cancelReason: null,
  depositReleaseDueAt: null,
  depositReleasedAt: null,
  depositReleasedByAdminId: null,
  createdAt: '2026-11-01T09:00:00.000Z',
  updatedAt: '2026-11-01T09:05:00.000Z',
};

/** OpenAPI `AdminTaxiBookingDetailDto`. */
const BOOKING_DETAIL = {
  ...BOOKING,
  checkouts: [
    {
      id: 'chk-1',
      kind: 'CUSTOMER_ADVANCE',
      status: 'PAID',
      amountPaise: 12000,
      customerAdvanceBpsSnapshot: 500,
      partnerDepositBpsSnapshot: null,
      policyVersionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7007',
      paymentRef: 'pay_hermetic_taxi_1',
      providerOrderId: null,
      providerPaymentId: 'pay_hermetic_provider_1',
      capturedPaise: 12000,
      capturedAt: '2026-11-01T09:06:00.000Z',
      createdAt: '2026-11-01T09:05:00.000Z',
    },
  ],
  refunds: [],
};

const META = { requestId: 'req-hermetic', correlationId: 'corr-hermetic' };

function enrollment(status: string) {
  return {
    orgId: ORG_ID,
    orgName: 'Hermetic Cabs',
    status,
    enrolledAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-11-01T09:00:00.000Z',
  };
}

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
      await json(route, 200, {
        data: [BOOKING],
        meta: {
          ...META,
          pagination: { limit: 25, cursor: null, nextCursor: null, hasMore: false },
        },
      });
      return;
    }
    if (method === 'GET' && path === `/admin/v1/taxi/bookings/${BOOKING_ID}`) {
      await json(route, 200, { data: BOOKING_DETAIL });
      return;
    }
    if (method === 'POST' && path === `/admin/v1/taxi/bookings/${BOOKING_ID}/cancel`) {
      capture.cancel.push({ body: req.postDataJSON() as unknown });
      await json(route, 200, {
        data: {
          ...BOOKING_DETAIL,
          status: 'CANCELLED_ADMIN',
          cancelledBy: 'ADMIN',
          cancelCode: 'ADMIN_CANCEL',
          customerAdvanceStatus: 'REFUND_PENDING',
          revenue: [],
          outcome: {
            advance: { decision: 'REFUND', amountPaise: 12000 },
            deposit: { decision: 'NONE', amountPaise: 0 },
          },
        },
      });
      return;
    }
    if (method === 'GET' && path === '/admin/v1/taxi/enrollments') {
      await json(route, 200, { data: [enrollment(enrollmentStatus)], meta: META });
      return;
    }
    if (method === 'POST' && path === `/admin/v1/taxi/enrollments/${ORG_ID}/suspend`) {
      capture.suspend.push(req.postDataJSON() as unknown);
      enrollmentStatus = 'SUSPENDED';
      await json(route, 200, { data: enrollment('SUSPENDED') });
      return;
    }
    if (method === 'POST' && path === `/admin/v1/taxi/enrollments/${ORG_ID}/reinstate`) {
      capture.reinstate += 1;
      enrollmentStatus = 'ACTIVE';
      await json(route, 200, { data: enrollment('ACTIVE') });
      return;
    }
    await json(route, 404, { error: { code: 'not_found', message: `Cannot ${method} ${path}` } });
  });
  return capture;
}

/** ADM-06 — Taxi bookings / enrollments against the CONTRACTS.md admin routes (stubbed). */
test.describe('Taxi operations (hermetic)', () => {
  test('bookings list → detail shows server money, checkouts; cancel with explicit outcomes', async ({
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
    await expect(page.getByTestId('taxi-booking-release')).toBeDisabled();

    await page.getByTestId('taxi-booking-cancel').click();
    await page.getByTestId('taxi-booking-cancel-reason').fill('Partner vehicle breakdown');
    // No default money outcome: Review stays disabled until both are chosen explicitly.
    await expect(page.getByTestId('taxi-booking-cancel-review')).toBeDisabled();
    await page.locator('input[name="taxi-cancel-advance"][value="REFUND"]').check();
    await page.locator('input[name="taxi-cancel-deposit"][value="RELEASE"]').check();
    await page.getByTestId('taxi-booking-cancel-review').click();
    await page.getByTestId('taxi-booking-cancel-confirm').click();
    await expect.poll(() => capture.cancel.length).toBe(1);
    expect(capture.cancel[0]).toMatchObject({
      body: {
        reason: 'Partner vehicle breakdown',
        advanceOutcome: 'REFUND',
        depositOutcome: 'RELEASE',
      },
    });
    await expect(page.getByTestId('taxi-booking-outcome')).toContainText(
      'Booking fee: ₹120 refunded to the customer.',
    );
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
