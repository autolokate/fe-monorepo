import { beforeEach, describe, expect, it } from 'vitest';

import { getSessionPhone, getSessionTokens, hasSession } from '@/lib/session';
import { envelope, installFakeFetch, resetWebsiteSession } from '@/test/fake-fetch';

import { fetchProfile, requestOtp, signOut, updateProfile, verifyOtp } from './auth-api';

const pair = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresAt: '2099-01-01T00:00:00.000Z',
  userId: 'user-1',
  isNewUser: true,
};

beforeEach(() => {
  resetWebsiteSession();
});

describe('website auth over the Nest contract (WEB-01)', () => {
  it('requests an OTP at POST /v1/auth/otp/request without a bearer', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/auth/otp/request', { status: 200, body: envelope({ channel: 'sms' }) });

    await expect(requestOtp('+919876543210')).resolves.toEqual({ channel: 'sms' });
    expect(fake.calls[0]?.body).toEqual({ phone: '+919876543210' });
    expect(fake.calls[0]?.headers.authorization).toBeUndefined();
  });

  it('verifies at POST /v1/auth/otp/verify and stores the pair as THE session', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/auth/otp/verify', { status: 200, body: envelope(pair) });

    await expect(verifyOtp('+919876543210', '123456')).resolves.toEqual({
      userId: 'user-1',
      isNewUser: true,
    });
    expect(fake.calls[0]?.body).toEqual({ phone: '+919876543210', code: '123456' });
    expect(getSessionTokens().getRefreshToken()).toBe('refresh-1');
    expect(getSessionPhone()).toBe('+919876543210');
  });

  it('surfaces a wrong code as an ApiError and stores nothing', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/auth/otp/verify', {
      status: 401,
      body: { error: { code: 'unauthorized', message: 'Invalid code' } },
    });

    await expect(verifyOtp('+919876543210', '000000')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid code',
    });
    expect(hasSession()).toBe(false);
  });

  it('reads the profile from GET /v1/profiles (WEB-04) and patches PATCH /v1/profile', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/auth/otp/verify', { status: 200, body: envelope(pair) });
    await verifyOtp('+919876543210', '123456');

    const profile = { name: 'Asha', locale: 'en-IN', photoMediaId: null, userName: null };
    fake.on('GET', '/v1/profiles', { status: 200, body: envelope(profile) });
    fake.on('PATCH', '/v1/profile', {
      status: 200,
      body: envelope({ ...profile, name: 'Asha K' }),
    });

    await expect(fetchProfile()).resolves.toEqual(profile);
    await expect(updateProfile({ name: '  Asha K ', locale: ' ' })).resolves.toMatchObject({
      name: 'Asha K',
    });

    const get = fake.calls.find((c) => c.path === '/v1/profiles');
    const patch = fake.calls.find((c) => c.path === '/v1/profile');
    expect(get?.headers.authorization).toBe('Bearer access-1');
    expect(patch?.body).toEqual({ name: 'Asha K' });
  });

  it('signs out: POST /v1/auth/logout with the bearer, then clears even if it fails', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/auth/otp/verify', { status: 200, body: envelope(pair) });
    await verifyOtp('+919876543210', '123456');
    fake.on('POST', '/v1/auth/logout', {
      status: 500,
      body: { error: { code: 'x', message: 'boom' } },
    });

    await signOut();

    const logout = fake.calls.find((c) => c.path === '/v1/auth/logout');
    expect(logout?.headers.authorization).toBe('Bearer access-1');
    expect(hasSession()).toBe(false);
  });
});
