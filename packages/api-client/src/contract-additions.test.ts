import { describe, expect, it, vi } from 'vitest';

import { isStepUpRequiredError, requestStepUpOtp, verifyStepUpOtp } from './auth';
import { ApiClient, ApiError } from './client';
import { unregisterDeviceToken } from './devices';
import { listAdminTaxiBookings } from './taxi-admin';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
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

describe('CONTRACTS.md additions', () => {
  it('step-up request + verify hit the contract paths and parse {accessToken, expiresIn}', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(202, { data: { channel: 'sms' } }))
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { accessToken: 'stepped', expiresIn: 900 } }),
      );
    const client = clientWith(fetchImpl);

    await expect(requestStepUpOtp(client)).resolves.toEqual({ channel: 'sms' });
    await expect(verifyStepUpOtp(client, { token: '123456' })).resolves.toEqual({
      accessToken: 'stepped',
      expiresIn: 900,
    });

    const [url1, init1] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url1).toBe('https://example.test/v1/auth/step-up/otp/request');
    expect(init1.method).toBe('POST');
    expect(init1.body).toBe('{}');
    const [url2, init2] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(url2).toBe('https://example.test/v1/auth/step-up/otp/verify');
    expect(init2.body).toBe(JSON.stringify({ token: '123456' }));
  });

  it('recognises step-up refusals by contract code and by legacy message', () => {
    expect(isStepUpRequiredError(new ApiError('nope', 403, 'step_up_required'))).toBe(true);
    expect(
      isStepUpRequiredError(
        new ApiError('Step-up (2FA) required for the admin plane.', 403, 'forbidden'),
      ),
    ).toBe(true);
    expect(isStepUpRequiredError(new ApiError('Forbidden', 403, 'forbidden'))).toBe(false);
    expect(isStepUpRequiredError(new ApiError('step_up_required', 401, 'unauthorized'))).toBe(
      false,
    );
  });

  it('DELETE /v1/devices/token sends {token} in the body (SHR-01)', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(204, null));
    await unregisterDeviceToken(clientWith(fetchImpl), { fcmToken: 'fcm-abc' });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.test/v1/devices/token');
    expect(init.method).toBe('DELETE');
    expect(init.body).toBe(JSON.stringify({ token: 'fcm-abc' }));
  });

  it('admin taxi bookings list accepts the {items, nextCursor} contract shape', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { items: [{ id: 'b1' }], nextCursor: 'c2' } }),
      );
    const page = await listAdminTaxiBookings(clientWith(fetchImpl), { status: 'CONFIRMED' });
    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).toBe('c2');
    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toBe('https://example.test/admin/v1/taxi/bookings?status=CONFIRMED');
  });
});
