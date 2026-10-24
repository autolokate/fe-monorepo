import { describe, expect, it, vi } from 'vitest';

import { getProfile, updateProfile } from './auth';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

describe('owner profile contract (CL-1)', () => {
  it('GET profile uses /v1/profiles', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: { name: 'Asha', locale: 'en', photoMediaId: null },
            meta: { requestId: 'r', correlationId: 'c' },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );

    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });

    const profile = await getProfile(client);
    expect(profile.name).toBe('Asha');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toBe(`https://example.test${endpoints.auth.profiles}`);
    expect(String(url)).toContain('/v1/profiles');
    expect(String(url)).not.toMatch(/\/v1\/profile$/);
    expect(init.method ?? 'GET').toBe('GET');
  });

  it('PATCH profile keeps /v1/profile', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: { name: 'Meera', locale: 'en', photoMediaId: null },
            meta: { requestId: 'r', correlationId: 'c' },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );

    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });

    const profile = await updateProfile(client, { name: 'Meera' });
    expect(profile.name).toBe('Meera');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toBe(`https://example.test${endpoints.auth.profile}`);
    expect(String(url)).toMatch(/\/v1\/profile$/);
    expect(String(url)).not.toContain('/v1/profiles');
    expect(init.method).toBe('PATCH');
  });
});
