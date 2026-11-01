import { describe, expect, it, vi } from 'vitest';

import {
  exportQrBatchCodesCsv,
  getAdminIncidentsFeed,
  grantUserRole,
  refundAdminOrder,
  revokeUserRole,
  updateAdminSupportTicketStatus,
} from './admin';
import { ApiClient, ApiError } from './client';
import { createVehicle } from './vehicles';
import {
  listAdminBookingSlots,
  listAdminWebsiteBookingsPage,
  publishAdminBookingSlots,
  transitionAdminWebsiteBooking,
} from './website-admin';

const META = { requestId: 'r', correlationId: 'c' };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function clientWith(fetchImpl: ReturnType<typeof vi.fn>): ApiClient {
  return new ApiClient({
    baseUrl: 'https://example.test',
    fetch: fetchImpl as unknown as typeof fetch,
    getAccessToken: () => 'token',
  });
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0) {
  const [url, init] = fetchImpl.mock.calls[index] as [string, RequestInit];
  return { url, init, headers: init.headers as Record<string, string> };
}

describe('admin ops contracts', () => {
  it('grant/revoke role send OPERATOR (never ADMIN) on the documented paths', async () => {
    const summary = { id: 'u1', roles: [] };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: summary, meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: summary, meta: META }));
    const client = clientWith(fetchImpl);

    await grantUserRole(client, 'u1', 'OPERATOR');
    await revokeUserRole(client, 'u1', 'OPERATOR');

    expect(call(fetchImpl, 0).url).toBe('https://example.test/admin/v1/users/u1/roles');
    expect(call(fetchImpl, 0).init.body).toBe(JSON.stringify({ role: 'OPERATOR' }));
    expect(call(fetchImpl, 1).url).toBe('https://example.test/admin/v1/users/u1/roles/OPERATOR');
    expect(call(fetchImpl, 1).init.method).toBe('DELETE');
  });

  it('surfaces the last_admin 409 code from the error envelope', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      jsonResponse(409, {
        error: { code: 'last_admin', message: 'Cannot revoke the last active OPERATOR.' },
      }),
    );
    const error = await revokeUserRole(clientWith(fetchImpl), 'u1', 'OPERATOR').catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('last_admin');
    expect((error as ApiError).status).toBe(409);
  });

  it('refund sends the Idempotency-Key header and parses either terminal state', async () => {
    const result = {
      orderId: 'o1',
      paymentRef: 'pay',
      refundId: 'rf',
      refundRef: null,
      state: 'REFUNDED',
      amountPaise: 49900,
      subscriptionId: null,
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: result, meta: META }));

    await expect(
      refundAdminOrder(clientWith(fetchImpl), 'o1', { reason: 'dup' }, { idempotencyKey: 'k-1' }),
    ).resolves.toEqual(result);
    const { url, headers, init } = call(fetchImpl);
    expect(url).toBe('https://example.test/admin/v1/orders/o1/refund');
    expect(headers['Idempotency-Key']).toBe('k-1');
    expect(init.body).toBe(JSON.stringify({ reason: 'dup' }));
  });

  it('support PATCH sends status + note', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(200, { data: {}, meta: META }));
    await updateAdminSupportTicketStatus(clientWith(fetchImpl), 't1', {
      status: 'RESOLVED',
      note: 'called back',
    });
    const { url, init } = call(fetchImpl);
    expect(url).toBe('https://example.test/admin/v1/support/tickets/t1');
    expect(init.method).toBe('PATCH');
    expect(init.body).toBe(JSON.stringify({ status: 'RESOLVED', note: 'called back' }));
  });

  it('QR codes export is an authenticated CSV fetch with optional status', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      new Response('code,status,createdAt\n', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="batch-b1.csv"',
        },
      }),
    );
    const out = await exportQrBatchCodesCsv(clientWith(fetchImpl), 'b1', { status: 'ACTIVE' });
    const { url, headers } = call(fetchImpl);
    expect(url).toBe('https://example.test/admin/v1/qr-batches/b1/codes/export?status=ACTIVE');
    expect(headers.Authorization).toBe('Bearer token');
    expect(headers.Accept).toBe('text/csv');
    expect(out.filename).toBe('batch-b1.csv');
  });

  it('incidents feed reads meta.feed for the next poll', async () => {
    const feed = { since: 'a', nextSince: 'b', hasMore: false, serverTime: 'c' };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [], meta: { ...META, feed } }));
    await expect(
      getAdminIncidentsFeed(clientWith(fetchImpl), {
        since: '2026-11-01T00:00:00.000Z',
        limit: 50,
      }),
    ).resolves.toEqual({ items: [], feed });
    expect(call(fetchImpl).url).toBe(
      'https://example.test/admin/v1/incidents/feed?since=2026-11-01T00%3A00%3A00.000Z&limit=50',
    );
  });

  it('website booking ops hit the documented paths', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [], meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: [], meta: META }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [],
          meta: {
            ...META,
            pagination: { limit: 50, cursor: null, nextCursor: 'n', hasMore: true },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { data: {}, meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: {}, meta: META }));
    const client = clientWith(fetchImpl);

    await listAdminBookingSlots(client, { from: '2026-11-10', days: 7 });
    await publishAdminBookingSlots(client, '2026-11-10', {
      slots: [{ startTime: '10:00', endTime: '10:30' }],
    });
    const page = await listAdminWebsiteBookingsPage(client, { status: 'PENDING' });
    await transitionAdminWebsiteBooking(client, 'b1', 'cancel', { reason: 'no-show' });
    await transitionAdminWebsiteBooking(client, 'b1', 'confirm');

    expect(call(fetchImpl, 0).url).toBe(
      'https://example.test/admin/v1/website/booking-slots?from=2026-11-10&days=7',
    );
    expect(call(fetchImpl, 1).init.method).toBe('PUT');
    expect(call(fetchImpl, 1).url).toBe(
      'https://example.test/admin/v1/website/booking-slots/2026-11-10',
    );
    expect(page.pagination?.nextCursor).toBe('n');
    expect(call(fetchImpl, 3).url).toBe('https://example.test/admin/v1/website/bookings/b1/cancel');
    expect(call(fetchImpl, 3).init.body).toBe(JSON.stringify({ reason: 'no-show' }));
    expect(call(fetchImpl, 4).init.body).toBeUndefined();
  });

  it('createVehicle forwards an optional Idempotency-Key', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(201, { data: {}, meta: META }));
    await createVehicle(
      clientWith(fetchImpl),
      { registration: 'DL7CQ1939' },
      { idempotencyKey: 'v-1' },
    );
    expect(call(fetchImpl).headers['Idempotency-Key']).toBe('v-1');
  });
});
