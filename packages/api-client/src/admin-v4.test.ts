import { describe, expect, it, vi } from 'vitest';

import { revokeUserRole, retireQrCode } from './admin';
import {
  clearAdminScanFlag,
  getAdminActiveVehicleDuplicates,
  listAdminTaxiFleetVehicles,
  retryAdminTaxiRefund,
  searchAdminVehiclesByPlate,
  sendAdminSystemNotification,
} from './admin-v4';
import { ApiClient, ApiError } from './client';
import { closeAdminTaxiRequest, listAdminTaxiRequestsPage } from './partners-admin';

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

describe('admin v4 contracts', () => {
  it('fleet list forwards filters and reads keyset pagination', async () => {
    const pagination = { limit: 25, cursor: null, nextCursor: 'n1', hasMore: true };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { data: [{ id: 'v1' }], meta: { ...META, pagination } }),
      );
    const page = await listAdminTaxiFleetVehicles(clientWith(fetchImpl), {
      canBid: false,
      mediaStatus: 'EXPIRED',
      limit: 25,
    });
    expect(call(fetchImpl).url).toBe(
      'https://example.test/admin/v1/taxi/vehicles?canBid=false&mediaStatus=EXPIRED&limit=25',
    );
    expect(page.items).toHaveLength(1);
    expect(page.pagination?.nextCursor).toBe('n1');
  });

  it('refund retry sends the Idempotency-Key header and the reason', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { id: 'r1', status: 'REQUESTED' }, meta: META }),
      );
    await retryAdminTaxiRefund(clientWith(fetchImpl), 'r1', { reason: 'Provider fixed' }, 'k-1');
    const { url, init, headers } = call(fetchImpl);
    expect(url).toBe('https://example.test/admin/v1/taxi/refunds/r1/retry');
    expect(headers['Idempotency-Key']).toBe('k-1');
    expect(init.body).toBe(JSON.stringify({ reason: 'Provider fixed' }));
  });

  it('system broadcast surfaces the 429 rate_limited code', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(429, { error: { code: 'rate_limited', message: 'Slow down' } }),
      );
    const error = await sendAdminSystemNotification(clientWith(fetchImpl), {
      audience: 'CONSUMER',
      accountIds: ['a1'],
      title: 't',
      body: 'b',
      reason: 'Outage notice',
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(429);
    expect((error as ApiError).code).toBe('rate_limited');
  });

  it('plate search reads `{items}` and encodes the plate', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { items: [{ vehicleId: 'v1' }] }, meta: META }),
      );
    const rows = await searchAdminVehiclesByPlate(clientWith(fetchImpl), ' KA 01 AB 1234 ');
    expect(call(fetchImpl).url).toBe('https://example.test/admin/v1/vehicles?plate=KA+01+AB+1234');
    expect(rows).toEqual([{ vehicleId: 'v1' }]);
  });

  it('scan flag clear posts no body; duplicates check defaults safely', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: { cleared: true }, meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: { indexPresent: true }, meta: META }));
    const client = clientWith(fetchImpl);
    await clearAdminScanFlag(client, 'f1');
    expect(call(fetchImpl, 0).init.body).toBeUndefined();
    await expect(getAdminActiveVehicleDuplicates(client)).resolves.toEqual({
      indexPresent: true,
      duplicates: [],
    });
  });

  it('optional reasons are sent only when present (role revoke, QR retire)', async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(jsonResponse(200, { data: { id: 'u1', roles: [] }, meta: META })),
      );
    const client = clientWith(fetchImpl);
    await revokeUserRole(client, 'u1', 'OPERATOR', { reason: 'Left the team' });
    await retireQrCode(client, 'ALK-1');
    expect(call(fetchImpl, 0).init.body).toBe(JSON.stringify({ reason: 'Left the team' }));
    expect(call(fetchImpl, 1).init.body).toBeUndefined();
  });

  it('taxi requests forward region/date filters; close posts the reason', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [], meta: META }))
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { id: 't1', status: 'EXPIRED' }, meta: META }),
      );
    const client = clientWith(fetchImpl);
    await listAdminTaxiRequestsPage(client, {
      pickupState: 'Karnataka',
      pickupCity: 'Bengaluru',
      from: '2026-11-01T00:00:00.000Z',
    });
    expect(call(fetchImpl, 0).url).toContain('pickupState=Karnataka&pickupCity=Bengaluru&from=');
    await closeAdminTaxiRequest(client, 't1', { reason: 'Spam request' });
    expect(call(fetchImpl, 1).url).toBe('https://example.test/admin/v1/taxi/requests/t1/close');
    expect(call(fetchImpl, 1).init.body).toBe(JSON.stringify({ reason: 'Spam request' }));
  });
});
