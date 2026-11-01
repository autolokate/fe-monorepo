import { expect, test, type Page } from '@playwright/test';

import {
  HERMETIC_ORDER_ID,
  installHermeticApiRoutes,
  openOrdersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin order refund — POST /admin/v1/orders/{orderId}/refund (stubbed).
 * Proves the FE contract (Idempotency-Key, reason, confirmation, error handling), not the live route.
 */
async function openRefundDialog(page: Page, reason = 'Duplicate charge'): Promise<void> {
  await page.getByTestId(`order-refund-${HERMETIC_ORDER_ID}`).click({ timeout: 15_000 });
  await page.getByTestId('refund-order-reason').fill(reason);
}

test.describe('Orders refund (hermetic)', () => {
  test('requires confirmation, sends reason + UUID Idempotency-Key, shows the server state', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openOrdersPage(page);
    await openRefundDialog(page);

    await expect(page.getByTestId('refund-order-submit')).toBeDisabled();
    await page.getByTestId('refund-order-confirm').check();
    await page.getByTestId('refund-order-submit').click();

    await expect(page.getByTestId('refund-order-result')).toContainText('REFUND_PENDING');
    expect(capture.ordersRefund).toHaveLength(1);
    expect(capture.ordersRefund[0]?.body).toEqual({ reason: 'Duplicate charge' });
    expect(capture.ordersRefund[0]?.idempotencyKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  test('502 refund_failed → retry allowed with a NEW key', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      ordersRefundStatus: 502,
    });
    await seedHermeticSession(page);
    await openOrdersPage(page);
    await openRefundDialog(page);
    await page.getByTestId('refund-order-confirm').check();
    await page.getByTestId('refund-order-submit').click();

    await expect(page.getByTestId('refund-order-error')).toContainText('Nothing was refunded');
    await page.getByTestId('refund-order-submit').click();
    await expect.poll(() => capture.ordersRefund.length).toBe(2);
    expect(capture.ordersRefund[1]?.idempotencyKey).not.toBe(
      capture.ordersRefund[0]?.idempotencyKey,
    );
  });

  test('503 vendor_unavailable → do not retry (reconciliation), submit disabled', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      ordersRefundStatus: 503,
    });
    await seedHermeticSession(page);
    await openOrdersPage(page);
    await openRefundDialog(page);
    await page.getByTestId('refund-order-confirm').check();
    await page.getByTestId('refund-order-submit').click();

    await expect(page.getByTestId('refund-order-error')).toContainText('Do not retry');
    await expect(page.getByTestId('refund-order-error')).toContainText('reconciliation');
    await expect(page.getByTestId('refund-order-submit')).toBeDisabled();
    expect(capture.ordersRefund).toHaveLength(1);
  });

  test('409 order_not_refundable → explained, no retry', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR', ordersRefundStatus: 409 });
    await seedHermeticSession(page);
    await openOrdersPage(page);
    await openRefundDialog(page);
    await page.getByTestId('refund-order-confirm').check();
    await page.getByTestId('refund-order-submit').click();

    await expect(page.getByTestId('refund-order-error')).toContainText('can’t be refunded');
    await expect(page.getByTestId('refund-order-submit')).toBeDisabled();
  });
});
