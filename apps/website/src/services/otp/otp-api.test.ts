import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api/error';
import { BASE_URL } from '@/services/api.service';
import { clearPurchaseSession, getPurchaseSession } from '@/services/purchase/session';
import { requestPurchaseOtp, verifyPurchaseOtp } from './otp-api';

const OTP_HOST = BASE_URL;

beforeEach(() => {
  nock.disableNetConnect();
  clearPurchaseSession();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
  clearPurchaseSession();
});

describe('requestPurchaseOtp', () => {
  it('POSTs /v1/auth/otp/request with phone to the shared API base URL', async () => {
    let capturedBody: unknown;

    nock(OTP_HOST)
      .post('/v1/auth/otp/request', (body) => {
        capturedBody = body;
        return true;
      })
      .reply(200, { data: { ok: true } });

    await requestPurchaseOtp({ phone: '+919876543210' });

    expect(capturedBody).toEqual({ phone: '+919876543210' });
    expect(nock.isDone()).toBe(true);
  });

  it('surfaces HTTP errors as ApiError', async () => {
    nock(OTP_HOST)
      .post('/v1/auth/otp/request')
      .reply(429, { error: { message: 'too many requests' } });

    await expect(requestPurchaseOtp({ phone: '+919876543210' })).rejects.toMatchObject({
      message: 'too many requests',
      status: 429,
    });
  });
});

describe('verifyPurchaseOtp', () => {
  it('POSTs /v1/auth/otp/verify and stashes the purchase session', async () => {
    let capturedBody: unknown;

    nock(OTP_HOST)
      .post('/v1/auth/otp/verify', (body) => {
        capturedBody = body;
        return true;
      })
      .reply(200, {
        data: {
          accessToken: 'access-new',
          refreshToken: 'refresh-new',
          expiresAt: '2099-01-01T00:00:00.000Z',
          userId: 'user-42',
          isNewUser: true,
        },
      });

    const result = await verifyPurchaseOtp({ phone: '+919876543210', code: '123456' });

    expect(capturedBody).toEqual({ phone: '+919876543210', code: '123456' });
    expect(result).toEqual({
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
      expiresAt: '2099-01-01T00:00:00.000Z',
      userId: 'user-42',
      isNewUser: true,
    });
    expect(getPurchaseSession()).toEqual({
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
      expiresAt: '2099-01-01T00:00:00.000Z',
      userId: 'user-42',
      phone: '+919876543210',
    });
  });

  it('throws ApiError and does not stash session when accessToken is missing', async () => {
    nock(OTP_HOST)
      .post('/v1/auth/otp/verify')
      .reply(200, { data: { refreshToken: 'only-refresh' } });

    await expect(
      verifyPurchaseOtp({ phone: '+919876543210', code: '000000' }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(getPurchaseSession()).toBeNull();
  });

  it('surfaces invalid OTP as ApiError without stashing', async () => {
    nock(OTP_HOST)
      .post('/v1/auth/otp/verify')
      .reply(401, { error: { message: 'invalid code' } });

    await expect(verifyPurchaseOtp({ phone: '+919876543210', code: 'bad' })).rejects.toMatchObject({
      message: 'invalid code',
      status: 401,
    });
    expect(getPurchaseSession()).toBeNull();
  });
});
