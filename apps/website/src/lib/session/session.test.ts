import { beforeEach, describe, expect, it, vi } from 'vitest';

import { http } from '@/lib/api/client';
import { envelope, installFakeFetch, resetWebsiteSession } from '@/test/fake-fetch';

import {
  SESSION_CHANGE_EVENT,
  SESSION_STORAGE_KEY,
  ensureFreshAccessToken,
  getSessionTokens,
  hasSession,
  resetSessionForTests,
  saveSession,
  subscribeSession,
} from './index';

const future = () => new Date(Date.now() + 15 * 60_000).toISOString();
const past = () => new Date(Date.now() - 60_000).toISOString();

function seed(expiresAt = future()) {
  saveSession(
    { accessToken: 'access-1', refreshToken: 'refresh-1', expiresAt, userId: 'user-1' },
    '+919876543210',
  );
}

const rotated = {
  accessToken: 'access-2',
  refreshToken: 'refresh-2',
  expiresAt: '2099-01-01T00:00:00.000Z',
  userId: 'user-1',
};

beforeEach(() => {
  resetWebsiteSession();
});

describe('website session model (WEB-05)', () => {
  it('stores the token pair in sessionStorage only — no cookie, no localStorage', () => {
    seed();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toContain('refresh-1');
    expect(localStorage.length).toBe(0);
    expect(hasSession()).toBe(true);
  });

  it('migrates a legacy purchase session out of localStorage and purges legacy keys', () => {
    localStorage.setItem(
      'autolokate:purchase-session',
      JSON.stringify({ accessToken: 'old-a', refreshToken: 'old-r', userId: 'u', phone: '+91' }),
    );
    localStorage.setItem('autolokate_access_token', 'marketing-a');
    localStorage.setItem('autolokate_refresh_token', 'marketing-r');
    resetSessionForTests();

    const tokens = getSessionTokens();
    expect(tokens.getRefreshToken()).toBe('old-r');
    // Unknown expiry is treated as expired so the first call rotates it.
    expect(tokens.isExpired()).toBe(true);
    expect(localStorage.length).toBe(0);
  });

  it('notifies subscribers on save and clear', () => {
    const handler = vi.fn();
    const off = subscribeSession(handler);
    seed();
    getSessionTokens().clear();
    off();
    expect(handler).toHaveBeenCalledTimes(2);
    expect(SESSION_CHANGE_EVENT).toBe('autolokate:session-change');
  });
});

describe('refresh (WEB-02)', () => {
  it('rotates with a camelCase { refreshToken } body and stores the ROTATED pair', async () => {
    const fake = installFakeFetch();
    seed(past());
    fake.on('POST', '/v1/auth/refresh', { status: 200, body: envelope(rotated) });

    await expect(ensureFreshAccessToken()).resolves.toBe('access-2');

    const call = fake.calls[0];
    expect(call.body).toEqual({ refreshToken: 'refresh-1' });
    expect(call.headers.authorization).toBeUndefined();
    expect(getSessionTokens().read()).toEqual(rotated);
  });

  it('on a 401 refreshes ONCE for concurrent requests and replays each with the new token', async () => {
    const fake = installFakeFetch();
    seed();
    let refreshCalls = 0;
    fake.on(
      'GET',
      '/v1/addresses',
      (call) =>
        call.headers.authorization === 'Bearer access-1'
          ? { status: 401, body: { error: { code: 'unauthorized', message: 'expired' } } }
          : { status: 200, body: envelope([]) },
      6,
    );
    fake.on(
      'POST',
      '/v1/auth/refresh',
      async () => {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 10));
        return { status: 200, body: envelope(rotated) };
      },
      3,
    );

    const results = await Promise.all([
      http.get('/v1/addresses'),
      http.get('/v1/addresses'),
      http.get('/v1/addresses'),
    ]);

    expect(results.map((r) => r.data)).toEqual([envelope([]), envelope([]), envelope([])]);
    expect(refreshCalls).toBe(1);
    const retried = fake.calls.filter(
      (c) => c.path === '/v1/addresses' && c.headers.authorization === 'Bearer access-2',
    );
    expect(retried).toHaveLength(3);
    expect(getSessionTokens().getRefreshToken()).toBe('refresh-2');
  });

  it('drops the session when the server rejects the refresh token (reuse / revoked)', async () => {
    const fake = installFakeFetch();
    seed();
    fake.on('GET', '/v1/addresses', {
      status: 401,
      body: { error: { code: 'unauthorized', message: 'expired' } },
    });
    fake.on('POST', '/v1/auth/refresh', {
      status: 401,
      body: { error: { code: 'unauthorized', message: 'refresh token reused' } },
    });

    await expect(http.get('/v1/addresses')).rejects.toMatchObject({ status: 401 });
    expect(hasSession()).toBe(false);
  });

  it('keeps the session when the refresh fails transiently (offline / 5xx)', async () => {
    const fake = installFakeFetch();
    seed(past());
    fake.on('POST', '/v1/auth/refresh', () => {
      throw new TypeError('fetch failed');
    });
    await ensureFreshAccessToken();
    expect(hasSession()).toBe(true);

    fake.on('POST', '/v1/auth/refresh', {
      status: 503,
      body: { error: { code: 'x', message: 'down' } },
    });
    await ensureFreshAccessToken();
    expect(hasSession()).toBe(true);
    expect(getSessionTokens().getRefreshToken()).toBe('refresh-1');
  });

  it('never attaches a bearer to anonymous calls and never refreshes for them', async () => {
    const fake = installFakeFetch();
    seed();
    fake.on('GET', '/v1/catalogue/brands', {
      status: 401,
      body: { error: { code: 'u', message: 'no' } },
    });

    await expect(http.get('/v1/catalogue/brands', { withAuth: false })).rejects.toMatchObject({
      status: 401,
    });
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]?.headers.authorization).toBeUndefined();
    expect(hasSession()).toBe(true);
  });
});
