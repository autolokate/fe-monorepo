import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createOrder, getOrder, getOrderPayment, listOrders, payOrder } from './orders-api';
import { PURCHASE_API_BASE_URL } from './client';
import { clearPurchaseSession, setPurchaseSession } from './session';

const HOST = PURCHASE_API_BASE_URL;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function seedSession(): void {
  setPurchaseSession({
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    userId: 'user-1',
    phone: '+919876543210',
  });
}

beforeEach(() => {
  nock.disableNetConnect();
  clearPurchaseSession();
  seedSession();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
  clearPurchaseSession();
});

describe('createOrder', () => {
  it('POSTs /v1/orders with cartId, addressId, and Idempotency-Key', async () => {
    let capturedBody: unknown;

    nock(HOST)
      .post('/v1/retail/orders', (body) => {
        capturedBody = body;
        return true;
      })
      .matchHeader('authorization', 'Bearer access-token-1')
      .matchHeader('idempotency-key', UUID_RE)
      .reply(200, {
        data: {
          orderId: 'ord_1',
          subtotalPaise: 1000,
          gstPaise: 180,
          discountPaise: 0,
          totalPaise: 1180,
          status: 'PENDING_PAYMENT',
        },
      });

    const order = await createOrder({ cartId: 'cart_1', addressId: 'addr_1' });

    expect(order.orderId).toBe('ord_1');
    expect(capturedBody).toEqual({ cartId: 'cart_1', addressId: 'addr_1' });
    expect(nock.isDone()).toBe(true);
  });

  it('throws ApiError when the envelope lacks orderId', async () => {
    nock(HOST)
      .post('/v1/retail/orders')
      .reply(200, { data: { totalPaise: 100 } });

    await expect(createOrder({ cartId: 'cart_1', addressId: 'addr_1' })).rejects.toMatchObject({
      message: 'Invalid order response',
      status: 0,
    });
  });

  it('surfaces HTTP errors as ApiError', async () => {
    nock(HOST)
      .post('/v1/retail/orders')
      .reply(400, { error: { code: 'BAD_REQUEST', message: 'cart expired' } });

    await expect(createOrder({ cartId: 'cart_x', addressId: 'addr_1' })).rejects.toMatchObject({
      message: 'cart expired',
      status: 400,
    });
  });
});

describe('payOrder', () => {
  it('POSTs /v1/orders/:id/pay with payload and Idempotency-Key', async () => {
    let capturedBody: unknown;

    nock(HOST)
      .post('/v1/retail/orders/ord_1/pay', (body) => {
        capturedBody = body;
        return true;
      })
      .matchHeader('authorization', 'Bearer access-token-1')
      .matchHeader('idempotency-key', UUID_RE)
      .reply(200, {
        data: {
          paymentRef: 'pay_ref_1',
          providerOrderId: 'rzp_order_1',
          razorpayKeyId: 'rzp_test_key',
        },
      });

    const ref = await payOrder('ord_1', { setupMandate: false, mandateConsent: true });

    expect(ref).toEqual({
      paymentRef: 'pay_ref_1',
      providerOrderId: 'rzp_order_1',
      razorpayKeyId: 'rzp_test_key',
    });
    expect(capturedBody).toEqual({ setupMandate: false, mandateConsent: true });
    expect(nock.isDone()).toBe(true);
  });

  it('throws ApiError when paymentRef is missing', async () => {
    nock(HOST)
      .post('/v1/retail/orders/ord_1/pay')
      .reply(200, { data: { razorpayKeyId: 'rzp_test' } });

    await expect(
      payOrder('ord_1', { setupMandate: true, mandateConsent: true }),
    ).rejects.toMatchObject({
      message: 'Invalid payment response',
      status: 0,
    });
  });
});

describe('retail order reads (Nest WebsiteRetailOrderDetailDto)', () => {
  const detail = {
    orderId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    subtotalPaise: 1000,
    gstPaise: 180,
    discountPaise: 0,
    totalPaise: 1180,
    appliedPromoCode: null,
    status: 'PAID',
    orderKind: 'RETAIL_SHIP',
    planName: 'AUTOLOKATE BASE',
    riderCount: 1,
    riderCoverPaise: 180,
    paymentOutcome: 'PAID',
    fulfillment: null,
    cartId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    addressId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    createdAt: '2026-10-26T00:00:00.000Z',
    updatedAt: '2026-10-26T00:00:00.000Z',
  };

  it('reads detail with real plan/rider fields and no invented shipping or order number', async () => {
    nock(HOST).get(`/v1/retail/orders/${detail.orderId}`).reply(200, { data: detail });

    const order = await getOrder(detail.orderId);

    expect(order).toMatchObject({
      orderKind: 'RETAIL_SHIP',
      planName: 'AUTOLOKATE BASE',
      riderCount: 1,
      fulfillment: null,
    });
    expect(order).not.toHaveProperty('orderNumber');
  });

  it('lists history rows in the same shape', async () => {
    nock(HOST)
      .get('/v1/retail/orders')
      .query({ limit: '20' })
      .reply(200, { data: [detail] });

    const rows = await listOrders();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ planName: 'AUTOLOKATE BASE', orderKind: 'RETAIL_SHIP' });
    expect(rows[0]).not.toHaveProperty('orderNumber');
  });

  it('accepts the coarse { outcome } payment poll', async () => {
    nock(HOST)
      .get(`/v1/retail/orders/${detail.orderId}/payment`)
      .reply(200, { data: { outcome: 'FAILED' } });

    await expect(getOrderPayment(detail.orderId)).resolves.toEqual({ outcome: 'FAILED' });
  });
});
