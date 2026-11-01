import { describe, expect, it, vi } from 'vitest';

import { ApiClient } from './client';
import {
  cancelAdminTaxiBooking,
  listAdminTaxiBookings,
  listAdminTaxiRevenue,
  releaseAdminTaxiBookingDeposit,
  resolveAdminTaxiDispute,
} from './taxi-admin';

const META = { requestId: 'r', correlationId: 'c' };
const OUTCOME = {
  advance: { decision: 'REFUND', amountPaise: 5000 },
  deposit: { decision: 'FORFEIT', amountPaise: 7000 },
};

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

describe('admin taxi money rules v2', () => {
  it('cancel sends explicit advance/deposit outcomes (no refundAdvance) and returns outcome', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { id: 'b1', status: 'CANCELLED_ADMIN', outcome: OUTCOME },
          meta: META,
        }),
      );
    const result = await cancelAdminTaxiBooking(clientWith(fetchImpl), 'b1', {
      reason: 'driver unreachable',
      advanceOutcome: 'REFUND',
      depositOutcome: 'FORFEIT',
    });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.test/admin/v1/taxi/bookings/b1/cancel');
    expect(JSON.parse(init.body as string)).toEqual({
      reason: 'driver unreachable',
      advanceOutcome: 'REFUND',
      depositOutcome: 'FORFEIT',
    });
    expect(result.outcome).toEqual(OUTCOME);
    expect(result.revenue).toEqual([]);
  });

  it('resolve and deposit release hit their routes', async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(jsonResponse(200, { data: { id: 'b1', outcome: OUTCOME }, meta: META })),
      );
    const client = clientWith(fetchImpl);
    await resolveAdminTaxiDispute(client, 'b1', { outcome: 'NO_FAULT', reason: 'both late' });
    await releaseAdminTaxiBookingDeposit(client, 'b1');
    expect((fetchImpl.mock.calls[0] as [string])[0]).toBe(
      'https://example.test/admin/v1/taxi/bookings/b1/resolve',
    );
    expect((fetchImpl.mock.calls[1] as [string])[0]).toBe(
      'https://example.test/admin/v1/taxi/bookings/b1/deposit/release',
    );
  });

  it('flagged filter and revenue ledger query strings', async () => {
    const page = {
      data: [],
      meta: { ...META, pagination: { limit: 20, cursor: null, nextCursor: 'n2', hasMore: true } },
    };
    const fetchImpl = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(200, page)));
    const client = clientWith(fetchImpl);
    await listAdminTaxiBookings(client, { flagged: true });
    const revenue = await listAdminTaxiRevenue(client, { kind: 'DEPOSIT_FORFEITED', orgId: 'o1' });
    expect((fetchImpl.mock.calls[0] as [string])[0]).toBe(
      'https://example.test/admin/v1/taxi/bookings?flagged=true',
    );
    expect((fetchImpl.mock.calls[1] as [string])[0]).toBe(
      'https://example.test/admin/v1/taxi/revenue?kind=DEPOSIT_FORFEITED&orgId=o1',
    );
    expect(revenue.nextCursor).toBe('n2');
  });
});
