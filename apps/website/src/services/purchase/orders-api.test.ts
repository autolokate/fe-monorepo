import { beforeEach, describe, expect, it } from 'vitest';

import { saveSession } from '@/lib/session';
import { installFakeFetch, resetWebsiteSession } from '@/test/fake-fetch';

import { createOrder, getOrder, getOrderPayment, listOrders, payOrder } from './orders-api';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let fake: ReturnType<typeof installFakeFetch>;

beforeEach(() => {
  resetWebsiteSession();
  saveSession(
    {
      accessToken: 'access-token-1',
      refreshToken: 'refresh-token-1',
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      userId: 'user-1',
    },
    '+919876543210',
  );
  fake = installFakeFetch();
});

describe('createOrder', () => {
  it('POSTs /v1/orders with cartId, addressId, and Idempotency-Key', async () => {
    fake.on('POST', '/v1/retail/orders', {
      status: 200,
      body: {
        data: {
          orderId: 'ord_1',
          subtotalPaise: 1000,
          gstPaise: 180,
          discountPaise: 0,
          totalPaise: 1180,
          status: 'PENDING_PAYMENT',
        },
      },
    });

    const order = await createOrder({ cartId: 'cart_1', addressId: 'addr_1' });

    expect(order.orderId).toBe('ord_1');
    const call = fake.calls[0];
    expect(call.body).toEqual({ cartId: 'cart_1', addressId: 'addr_1' });
    expect(call.headers.authorization).toBe('Bearer access-token-1');
    expect(call.headers['idempotency-key']).toMatch(UUID_RE);
  });

  it('throws ApiError when the envelope lacks orderId', async () => {
    fake.on('POST', '/v1/retail/orders', { status: 200, body: { data: { totalPaise: 100 } } });

    await expect(createOrder({ cartId: 'cart_1', addressId: 'addr_1' })).rejects.toMatchObject({
      message: 'Invalid order response',
      status: 0,
    });
  });

  it('surfaces HTTP errors as ApiError', async () => {
    fake.on('POST', '/v1/retail/orders', {
      status: 400,
      body: { error: { code: 'BAD_REQUEST', message: 'cart expired' } },
    });

    await expect(createOrder({ cartId: 'cart_x', addressId: 'addr_1' })).rejects.toMatchObject({
      message: 'cart expired',
      status: 400,
    });
  });
});

describe('payOrder', () => {
  it('POSTs /v1/orders/:id/pay with payload and Idempotency-Key', async () => {
    fake.on('POST', '/v1/retail/orders/ord_1/pay', {
      status: 200,
      body: {
        data: {
          paymentRef: 'pay_ref_1',
          providerOrderId: 'rzp_order_1',
          razorpayKeyId: 'rzp_test_key',
        },
      },
    });

    const ref = await payOrder('ord_1', { setupMandate: false, mandateConsent: true });

    expect(ref).toEqual({
      paymentRef: 'pay_ref_1',
      providerOrderId: 'rzp_order_1',
      razorpayKeyId: 'rzp_test_key',
    });
    const call = fake.calls[0];
    expect(call.body).toEqual({ setupMandate: false, mandateConsent: true });
    expect(call.headers.authorization).toBe('Bearer access-token-1');
    expect(call.headers['idempotency-key']).toMatch(UUID_RE);
  });

  it('throws ApiError when paymentRef is missing', async () => {
    fake.on('POST', '/v1/retail/orders/ord_1/pay', {
      status: 200,
      body: { data: { razorpayKeyId: 'rzp_test' } },
    });

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
    fake.on('GET', `/v1/retail/orders/${detail.orderId}`, { status: 200, body: { data: detail } });

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
    fake.on('GET', '/v1/retail/orders?limit=20', { status: 200, body: { data: [detail] } });

    const rows = await listOrders();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ planName: 'AUTOLOKATE BASE', orderKind: 'RETAIL_SHIP' });
    expect(rows[0]).not.toHaveProperty('orderNumber');
  });

  it('accepts the coarse { outcome } payment poll', async () => {
    fake.on('GET', `/v1/retail/orders/${detail.orderId}/payment`, {
      status: 200,
      body: { data: { outcome: 'FAILED' } },
    });

    await expect(getOrderPayment(detail.orderId)).resolves.toEqual({ outcome: 'FAILED' });
  });
});
