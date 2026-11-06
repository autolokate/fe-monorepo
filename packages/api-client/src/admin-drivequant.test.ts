import { describe, expect, it, vi } from 'vitest';

import { getAdminSosCrashTelemetry, getAdminUserTrip, listAdminUserCrashes } from './admin-v4';
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

function urlOf(fetchImpl: ReturnType<typeof vi.fn>, index = 0): string {
  return (fetchImpl.mock.calls[index] as [string, RequestInit])[0];
}

describe('admin DriveQuant telemetry contracts', () => {
  it('trip detail encodes both ids and unwraps the envelope', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        data: { tripId: 'itin/1', telemetry: null, scores: {} },
        meta: META,
      }),
    );
    const trip = await getAdminUserTrip(clientWith(fetchImpl), 'u-1', 'itin/1');
    expect(urlOf(fetchImpl)).toBe('https://example.test/admin/v1/users/u-1/trips/itin%2F1');
    expect(trip.tripId).toBe('itin/1');
    expect(trip.telemetry).toBeNull();
  });

  it('crash list forwards the limit; a non-array body reads as empty', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [{ crashId: 'c1' }], meta: META }))
      .mockResolvedValueOnce(jsonResponse(200, { data: null, meta: META }));
    const client = clientWith(fetchImpl);
    expect(await listAdminUserCrashes(client, 'u-1', { limit: 50 })).toHaveLength(1);
    expect(urlOf(fetchImpl)).toBe('https://example.test/admin/v1/users/u-1/crashes?limit=50');
    expect(await listAdminUserCrashes(client, 'u-1')).toEqual([]);
    expect(urlOf(fetchImpl, 1)).toBe('https://example.test/admin/v1/users/u-1/crashes');
  });

  it('SOS crash telemetry reads the list and surfaces step-up as ApiError', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [{ crashId: 'c1' }], meta: META }))
      .mockResolvedValueOnce(
        jsonResponse(403, { error: { code: 'step_up_required', message: 'Step-up required' } }),
      );
    const client = clientWith(fetchImpl);
    const rows = await getAdminSosCrashTelemetry(client, 'inc-1');
    expect(urlOf(fetchImpl)).toBe(
      'https://example.test/admin/v1/sos-incidents/inc-1/crash-telemetry',
    );
    expect(rows[0]?.crashId).toBe('c1');
    await expect(getAdminSosCrashTelemetry(client, 'inc-1')).rejects.toBeInstanceOf(ApiError);
  });
});
