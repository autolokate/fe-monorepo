import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createOrder, payOrder } from './orders-api';
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
      .post('/v1/orders', (body) => {
        capturedBody = body;
        return true;
      })
      .matchHeader('authorization', 'Bearer access-token-1')
      .matchHeader('idempotency-key', UUID_RE)
      .matchHeader('ngrok-skip-browser-warning', 'true')
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
      .post('/v1/orders')
      .reply(200, { data: { totalPaise: 100 } });

    await expect(createOrder({ cartId: 'cart_1', addressId: 'addr_1' })).rejects.toMatchObject({
      message: 'Invalid order response',
      status: 0,
    });
  });

  it('surfaces HTTP errors as ApiError', async () => {
    nock(HOST)
      .post('/v1/orders')
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
      .post('/v1/orders/ord_1/pay', (body) => {
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
      .post('/v1/orders/ord_1/pay')
      .reply(200, { data: { razorpayKeyId: 'rzp_test' } });

    await expect(
      payOrder('ord_1', { setupMandate: true, mandateConsent: true }),
    ).rejects.toMatchObject({
      message: 'Invalid payment response',
      status: 0,
    });
  });
});
