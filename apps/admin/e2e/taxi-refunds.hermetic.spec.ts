import { expect, test, type Page, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { HERMETIC_REFUND_ID, hermeticRefund } from './helpers/hermetic-taxi-v4';

const META = { requestId: 'req-hermetic', correlationId: 'corr-hermetic' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORG_ID = 'aaaaaaaa-0000-4000-8000-0000000000b1';

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

type Capture = {
  listQueries: string[];
  retries: Array<{ key: string | null; body: unknown }>;
  reinstate: unknown[];
};

async function stubRefunds(page: Page, retryStatus: number[] = [200]): Promise<Capture> {
  const capture: Capture = { listQueries: [], retries: [], reinstate: [] };
  await page.route(/\/admin\/v1\/taxi\/(refunds|enrollments)/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    if (req.method() === 'GET' && path === '/admin/v1/taxi/refunds') {
      capture.listQueries.push(url.search);
      await json(route, 200, {
        data: [hermeticRefund()],
        meta: {
          ...META,
          pagination: { limit: 25, cursor: null, nextCursor: null, hasMore: false },
        },
      });
      return;
    }
    if (req.method() === 'POST' && path === `/admin/v1/taxi/refunds/${HERMETIC_REFUND_ID}/retry`) {
      capture.retries.push({
        key: req.headers()['idempotency-key'] ?? null,
        body: req.postDataJSON() as unknown,
      });
      const status = retryStatus[capture.retries.length - 1] ?? 200;
      if (status === 409) {
        await json(route, 409, {
          error: { code: 'taxi_refund_not_retryable', message: 'Refund is not retryable' },
        });
        return;
      }
      if (status >= 500) {
        await json(route, status, { error: { code: 'internal', message: 'Upstream timeout' } });
        return;
      }
      await json(route, 200, {
        data: hermeticRefund({ status: 'REQUESTED', attempts: 3 }),
        meta: META,
      });
      return;
    }
    if (req.method() === 'GET' && path === '/admin/v1/taxi/enrollments') {
      await json(route, 200, {
        data: [
          {
            orgId: ORG_ID,
            orgName: 'Hermetic Suspended Cabs',
            status: capture.reinstate.length > 0 ? 'ACTIVE' : 'SUSPENDED',
            enrolledAt: '2026-10-01T09:00:00.000Z',
            updatedAt: '2026-11-01T09:00:00.000Z',
          },
        ],
        meta: META,
      });
      return;
    }
    if (req.method() === 'POST' && path === `/admin/v1/taxi/enrollments/${ORG_ID}/reinstate`) {
      capture.reinstate.push(req.postDataJSON() as unknown);
      await json(route, 200, {
        data: {
          orgId: ORG_ID,
          orgName: 'Hermetic Suspended Cabs',
          status: 'ACTIVE',
          enrolledAt: '2026-10-01T09:00:00.000Z',
          updatedAt: '2026-11-03T09:00:00.000Z',
        },
      });
      return;
    }
    await json(route, 404, {
      error: { code: 'not_found', message: `Cannot ${req.method()} ${path}` },
    });
  });
  return capture;
}

test.describe('Taxi refunds queue (hermetic)', () => {
  test('default view uses the server default; retry sends a reason + one Idempotency-Key per attempt', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    // First submit times out (5xx) → resend of the SAME attempt must reuse the key.
    const capture = await stubRefunds(page, [503, 200]);
    await seedHermeticSession(page);

    await page.goto('/taxi/refunds');
    await expect(page.getByRole('heading', { name: 'Taxi refunds' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('hermetic provider rejection')).toBeVisible();
    expect(capture.listQueries[0]).not.toContain('status=');

    await page.getByTestId(`taxi-refund-retry-${HERMETIC_REFUND_ID}`).click();
    await expect(page.getByTestId('taxi-refund-retry-confirm')).toBeDisabled();
    await page.getByTestId('taxi-refund-retry-reason').fill('Provider account re-enabled');
    await page.getByTestId('taxi-refund-retry-confirm').click();
    await expect(page.getByTestId('taxi-refund-retry-error')).toBeVisible();
    await page.getByTestId('taxi-refund-retry-confirm').click();
    await expect.poll(() => capture.retries.length).toBe(2);
    expect(capture.retries[0]?.key).toMatch(UUID);
    expect(capture.retries[1]?.key).toBe(capture.retries[0]?.key);
    expect(capture.retries[0]?.body).toEqual({ reason: 'Provider account re-enabled' });
    await expect(page.getByTestId('taxi-refund-retry-confirm')).toBeHidden();

    // A new attempt gets a fresh key.
    await page.getByTestId(`taxi-refund-retry-${HERMETIC_REFUND_ID}`).click();
    await page.getByTestId('taxi-refund-retry-reason').fill('Second attempt');
    await page.getByTestId('taxi-refund-retry-confirm').click();
    await expect.poll(() => capture.retries.length).toBe(3);
    expect(capture.retries[2]?.key).not.toBe(capture.retries[0]?.key);

    await page.getByTestId('filter-chip-PROCESSED').click();
    await expect.poll(() => capture.listQueries.at(-1)).toContain('status=PROCESSED');
    expect(base.unexpected).toEqual([]);
  });

  test('409 taxi_refund_not_retryable explains what to do', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await stubRefunds(page, [409]);
    await seedHermeticSession(page);
    await page.goto('/taxi/refunds');
    await page.getByTestId(`taxi-refund-retry-${HERMETIC_REFUND_ID}`).click({ timeout: 30_000 });
    await page.getByTestId('taxi-refund-retry-reason').fill('Try again');
    await page.getByTestId('taxi-refund-retry-confirm').click();
    await expect(page.getByTestId('taxi-refund-retry-error')).toContainText(
      'can no longer be retried',
    );
  });

  test('enrollment reinstate sends the optional reason', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await stubRefunds(page);
    await seedHermeticSession(page);
    await page.goto('/taxi/partners');
    await page.getByTestId(`taxi-enrollment-reinstate-${ORG_ID}`).click({ timeout: 30_000 });
    // Optional: confirm is enabled with no reason.
    await expect(page.getByTestId('taxi-enrollment-confirm')).toBeEnabled();
    await page.getByTestId('taxi-enrollment-reason').fill('KYC renewed');
    await page.getByTestId('taxi-enrollment-confirm').click();
    await expect.poll(() => capture.reinstate.length).toBe(1);
    expect(capture.reinstate[0]).toEqual({ reason: 'KYC renewed' });
  });
});
