import type { Page } from '@playwright/test';

import { apiBaseUrl, otpCredentialsFromEnv, tokensFromEnv, type AdminTokenPair } from './env';

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

type Envelope<T> = { data: T };

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as Envelope<T> & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(
      `API ${path} → ${String(response.status)}: ${json.error?.message ?? JSON.stringify(json)}`,
    );
  }
  return json.data;
}

/** Resolve admin tokens from env tokens or OTP verify. */
export async function resolveAdminTokens(): Promise<AdminTokenPair> {
  const fromEnv = tokensFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  const otp = otpCredentialsFromEnv();
  if (!otp) {
    throw new Error(
      'Set E2E_ADMIN_ACCESS_TOKEN + E2E_ADMIN_REFRESH_TOKEN + E2E_ADMIN_USER_ID, ' +
        'or E2E_ADMIN_PHONE + E2E_ADMIN_OTP.',
    );
  }

  await postJson<{ channel: string }>('/v1/auth/otp/request', { phone: otp.phone });
  const verified = await postJson<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    userId: string;
  }>('/v1/auth/otp/verify', { phone: otp.phone, code: otp.code });

  return {
    accessToken: verified.accessToken,
    refreshToken: verified.refreshToken,
    expiresAt: verified.expiresAt,
    userId: verified.userId,
  };
}

/**
 * Inject the admin session into sessionStorage and land on a protected route.
 * Matches `AdminAuthProvider` / `createSessionTokenStorage('al-admin-auth-tokens-v1')`.
 */
export async function loginAsAdmin(page: Page, tokens?: AdminTokenPair): Promise<AdminTokenPair> {
  const session = tokens ?? (await resolveAdminTokens());

  await page.goto('/login');
  await page.evaluate(
    ({ key, value }) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    { key: ADMIN_TOKEN_KEY, value: session },
  );
  await page.goto('/qr-batches');
  await page.getByRole('heading', { name: 'QR Batch Management' }).waitFor();
  await page.getByText('Sign out').waitFor();
  return session;
}
