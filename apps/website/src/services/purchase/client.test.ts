import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  PURCHASE_API_BASE_URL,
  PurchaseApi,
  logoutPurchase,
  refreshPurchaseSession,
} from './client';
import {
  clearPurchaseSession,
  getPurchaseSession,
  getPurchaseToken,
  setPurchaseSession,
  type PurchaseSession,
} from './session';

const HOST = PURCHASE_API_BASE_URL;

function seedSession(overrides: Partial<PurchaseSession> = {}): void {
  setPurchaseSession({
    accessToken: 'access-live',
    refreshToken: 'refresh-live',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    userId: 'user-1',
    phone: '+919876543210',
    ...overrides,
  });
}

beforeEach(() => {
  nock.disableNetConnect();
  clearPurchaseSession();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
  clearPurchaseSession();
});

describe('refreshPurchaseSession', () => {
  it('returns the live access token without hitting the network', async () => {
    seedSession();
    const token = await refreshPurchaseSession();
    expect(token).toBe('access-live');
    expect(nock.pendingMocks()).toEqual([]);
  });

  it('POSTs /v1/auth/refresh with camelCase refreshToken and updates session', async () => {
    seedSession({
      accessToken: 'access-expired',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });

    let capturedBody: unknown;
    nock(HOST)
      .post('/v1/auth/refresh', (body) => {
        capturedBody = body;
        return true;
      })
      .matchHeader('ngrok-skip-browser-warning', 'true')
      .reply(200, {
        data: {
          accessToken: 'access-refreshed',
          refreshToken: 'refresh-rotated',
          expiresAt: '2099-06-01T00:00:00.000Z',
          userId: 'user-1',
        },
      });

    const token = await refreshPurchaseSession();

    expect(capturedBody).toEqual({ refreshToken: 'refresh-live' });
    expect(token).toBe('access-refreshed');
    expect(getPurchaseSession()).toMatchObject({
      accessToken: 'access-refreshed',
      refreshToken: 'refresh-rotated',
      expiresAt: '2099-06-01T00:00:00.000Z',
      phone: '+919876543210',
    });
  });

  it('force:true refreshes even when the access token still looks live', async () => {
    seedSession();

    nock(HOST)
      .post('/v1/auth/refresh', { refreshToken: 'refresh-live' })
      .reply(200, { data: { accessToken: 'access-forced' } });

    const token = await refreshPurchaseSession(true);
    expect(token).toBe('access-forced');
    expect(getPurchaseToken()).toBe('access-forced');
  });

  it('clears the session and returns null when refresh fails', async () => {
    seedSession({
      accessToken: 'access-expired',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });

    nock(HOST)
      .post('/v1/auth/refresh')
      .reply(401, { error: { message: 'refresh dead' } });

    const token = await refreshPurchaseSession();
    expect(token).toBeNull();
    expect(getPurchaseSession()).toBeNull();
  });

  it('returns null without calling the network when no refresh token exists', async () => {
    setPurchaseSession({
      accessToken: 'access-only',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });

    const token = await refreshPurchaseSession();
    expect(token).toBeNull();
    expect(nock.pendingMocks()).toEqual([]);
  });
});

describe('401 retry interceptor', () => {
  it('refreshes once and retries the original request with the new bearer', async () => {
    // Interceptor calls refreshPurchaseSession() without force — so the stored
    // access token must already look expired, otherwise refresh is a no-op and
    // the retry reuses the same bearer (as implemented).
    seedSession({
      accessToken: 'access-stale',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });

    nock(HOST)
      .get('/v1/profile')
      .matchHeader('authorization', 'Bearer access-stale')
      .reply(401, { error: { message: 'expired' } });

    nock(HOST)
      .post('/v1/auth/refresh', { refreshToken: 'refresh-live' })
      .reply(200, { data: { accessToken: 'access-after-401' } });

    nock(HOST)
      .get('/v1/profile')
      .matchHeader('authorization', 'Bearer access-after-401')
      .reply(200, { data: { id: 'user-1' } });

    const res = await PurchaseApi.get<{ data: { id: string } }>('/v1/profile');

    expect(res.data.data.id).toBe('user-1');
    expect(getPurchaseToken()).toBe('access-after-401');
    expect(nock.isDone()).toBe(true);
  });
});

describe('logoutPurchase', () => {
  it('POSTs /v1/auth/logout while the bearer is still attached', async () => {
    seedSession();

    nock(HOST)
      .post('/v1/auth/logout', {})
      .matchHeader('authorization', 'Bearer access-live')
      .reply(200, { data: { ok: true } });

    await logoutPurchase();
    // Local cleanup is the caller's job — logoutPurchase is best-effort network only.
    expect(getPurchaseToken()).toBe('access-live');
    expect(nock.isDone()).toBe(true);
  });

  it('swallows network failures (best-effort)', async () => {
    seedSession();
    nock(HOST)
      .post('/v1/auth/logout')
      .reply(500, { error: { message: 'down' } });

    await expect(logoutPurchase()).resolves.toBeUndefined();
    expect(getPurchaseToken()).toBe('access-live');
  });

  it('no-ops when there is no access token', async () => {
    await expect(logoutPurchase()).resolves.toBeUndefined();
    expect(nock.pendingMocks()).toEqual([]);
  });
});
