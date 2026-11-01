import { beforeEach, describe, expect, it } from 'vitest';

import { envelope, installFakeFetch, resetWebsiteSession } from '@/test/fake-fetch';

import { http, withQuery } from './client';
import { ApiError } from './error';

beforeEach(() => {
  resetWebsiteSession();
});

describe('withQuery', () => {
  it('drops empty values, repeats arrays and appends to an existing query', () => {
    expect(withQuery('/v1/x', { a: 1, b: undefined, c: '', d: null, e: ['p', 'q'] })).toBe(
      '/v1/x?a=1&e=p&e=q',
    );
    expect(withQuery('/v1/x?ids=1', { q: 'a b' })).toBe('/v1/x?ids=1&q=a+b');
    expect(withQuery('/v1/x')).toBe('/v1/x');
  });
});

describe('http facade over the shared api-client', () => {
  it('returns the parsed body under `data` and sends custom headers', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/retail/orders', { status: 200, body: envelope({ orderId: 'o1' }) });

    const res = await http.post(
      '/v1/retail/orders',
      { cartId: 'c' },
      {
        headers: { 'Idempotency-Key': 'k-1' },
      },
    );

    expect(res.data).toEqual(envelope({ orderId: 'o1' }));
    expect(fake.calls[0]?.headers['idempotency-key']).toBe('k-1');
  });

  it('maps the Nest error envelope to ApiError with status + code', async () => {
    const fake = installFakeFetch();
    fake.on('PATCH', '/v1/cart/c1', {
      status: 409,
      body: { error: { code: 'cart_expired', message: 'Cart expired', requestId: 'r' } },
    });

    const err = await http.patch('/v1/cart/c1', {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'cart_expired', message: 'Cart expired' });
  });

  it('maps network failures to a status-0 ApiError with a readable message', async () => {
    const fake = installFakeFetch();
    fake.on('GET', '/v1/plans', () => {
      throw new TypeError('fetch failed');
    });
    await expect(http.get('/v1/plans', { withAuth: false })).rejects.toMatchObject({
      status: 0,
      message: expect.stringMatching(/network/i) as unknown,
    });
  });
});
