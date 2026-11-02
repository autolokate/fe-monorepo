import { describe, expect, it, vi } from 'vitest';

import { getAdminVehicleDrivers, getQrBatch, listQrInventoryPage } from './admin';
import { ApiClient } from './client';
import { getAdminExpert, listAdminExperts } from './experts-admin';

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

function urlOf(fetchImpl: ReturnType<typeof vi.fn>, call = 0): string {
  return (fetchImpl.mock.calls[call] as [string])[0];
}

const BATCH = {
  id: 'b1',
  batchCode: 'BATCH-1',
  channel: 'B2C',
  skuId: 's1',
  status: 'DRAFT',
  totalCount: 5,
  generatedCount: 0,
  provisionedCount: 0,
  createdAt: '2026-10-01T00:00:00.000Z',
  provisionedAt: null,
};

describe('admin v2 reads', () => {
  it('GET /admin/v1/vehicles/{id}/drivers unwraps AdminVehicleDriversDto', async () => {
    const data = {
      vehicleId: 'v 1',
      plate: 'MH12AB1234',
      owner: null,
      drivers: [
        {
          id: 'm1',
          accountId: 'a1',
          username: null,
          status: 'ACTIVE',
          resolvedAt: null,
          createdAt: '2026-10-01T00:00:00.000Z',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
      ],
    };
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(200, { data, meta: META }));
    const result = await getAdminVehicleDrivers(clientWith(fetchImpl), 'v 1');
    expect(urlOf(fetchImpl)).toBe('https://example.test/admin/v1/vehicles/v%201/drivers');
    expect(result).toEqual(data);
  });

  it('GET /admin/v1/qr-batches/{id} unwraps one BatchSummary', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(200, { data: BATCH, meta: META }));
    const result = await getQrBatch(clientWith(fetchImpl), 'b1');
    expect(urlOf(fetchImpl)).toBe('https://example.test/admin/v1/qr-batches/b1');
    expect(result).toEqual(BATCH);
  });

  it('GET /admin/v1/inventory sends state/limit/cursor and reads meta.pagination', async () => {
    const pagination = { limit: 100, cursor: 'c1', nextCursor: 'c2', hasMore: true };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [BATCH], meta: { ...META, pagination } }));
    const result = await listQrInventoryPage(clientWith(fetchImpl), {
      state: 'DRAFT',
      limit: 100,
      cursor: 'c1',
    });
    expect(urlOf(fetchImpl)).toBe(
      'https://example.test/admin/v1/inventory?state=DRAFT&limit=100&cursor=c1',
    );
    expect(result.items).toEqual([BATCH]);
    expect(result.pagination).toEqual(pagination);
  });

  it('GET /admin/v1/experts filters by status; GET /admin/v1/experts/{id} reads one', async () => {
    const expert = {
      id: 'e1',
      name: 'Asha',
      designation: '',
      bio: '',
      expertise: [],
      channelUrl: null,
      rating: null,
      sessionsCompleted: 0,
      status: 'INACTIVE',
      photoAsset: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [expert], meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: [expert], meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: expert, meta: META }));
    const client = clientWith(fetchImpl);
    expect(await listAdminExperts(client, { status: 'INACTIVE' })).toEqual([expert]);
    await listAdminExperts(client);
    expect(await getAdminExpert(client, 'e1')).toEqual(expert);
    expect(urlOf(fetchImpl, 0)).toBe('https://example.test/admin/v1/experts?status=INACTIVE');
    expect(urlOf(fetchImpl, 1)).toBe('https://example.test/admin/v1/experts');
    expect(urlOf(fetchImpl, 2)).toBe('https://example.test/admin/v1/experts/e1');
  });
});
