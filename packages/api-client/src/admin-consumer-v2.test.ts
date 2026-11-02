import { describe, expect, it, vi } from 'vitest';

import { getAdminUserEntitlements, getAdminUserStreak } from './admin';
import { ApiClient, ApiError } from './client';

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

describe('admin consumer v2 reads', () => {
  it('GET /admin/v1/users/{id}/entitlements unwraps the AccountEntitlementsDto', async () => {
    const data = {
      paid: true,
      planTier: 'SHIELD',
      source: 'SUBSCRIPTION',
      expiresAt: '2027-01-01T00:00:00.000Z',
      features: { driveQuant: true, leaderboard: true, academy: true, ai: true },
      vehicles: [{ vehicleId: 'v1', role: 'PROVISIONAL_OWNER', ownershipVerified: false }],
    };
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(200, { data, meta: META }));
    const result = await getAdminUserEntitlements(clientWith(fetchImpl), 'u 1');
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.test/admin/v1/users/u%201/entitlements');
    expect(init.method ?? 'GET').toBe('GET');
    expect(result).toEqual(data);
  });

  it('GET /admin/v1/users/{id}/streak unwraps the StreakDto', async () => {
    const data = {
      current: 4,
      longest: 9,
      todayCompleted: false,
      lastActiveDate: '2026-11-01',
      forgivenessUsedThisWeek: true,
      weekStart: '2026-10-26',
      nextMilestone: 7,
      celebrate: null,
    };
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(200, { data, meta: META }));
    const result = await getAdminUserStreak(clientWith(fetchImpl), 'u1');
    expect((fetchImpl.mock.calls[0] as [string])[0]).toBe(
      'https://example.test/admin/v1/users/u1/streak',
    );
    expect(result).toEqual(data);
  });

  it('surfaces a 404 (route not deployed yet) as an ApiError', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(404, { error: { code: 'not_found', message: 'Cannot GET' }, meta: META }),
      );
    await expect(getAdminUserStreak(clientWith(fetchImpl), 'u1')).rejects.toBeInstanceOf(ApiError);
  });
});
