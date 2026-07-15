/** Required / optional env for admin Playwright e2e. */

export function apiBaseUrl(): string {
  return (process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
}

/**
 * Preferred SKU label in the create-batch dropdown (`sku_code`).
 * Defaults to the fixed catalog seed `SKU-B2C-RETAIL`.
 */
export function e2eSkuCode(): string {
  return process.env.E2E_SKU_CODE?.trim() || 'SKU-B2C-RETAIL';
}

export type AdminTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
};

export function tokensFromEnv(): AdminTokenPair | null {
  const accessToken = process.env.E2E_ADMIN_ACCESS_TOKEN?.trim();
  const refreshToken = process.env.E2E_ADMIN_REFRESH_TOKEN?.trim();
  const userId = process.env.E2E_ADMIN_USER_ID?.trim();
  const expiresAt =
    process.env.E2E_ADMIN_EXPIRES_AT?.trim() ?? new Date(Date.now() + 14 * 60 * 1000).toISOString();
  if (!accessToken || !refreshToken || !userId) {
    return null;
  }
  return { accessToken, refreshToken, expiresAt, userId };
}

export function otpCredentialsFromEnv(): { phone: string; code: string } | null {
  const digits = process.env.E2E_ADMIN_PHONE?.replace(/\D/g, '').slice(-10);
  const code = process.env.E2E_ADMIN_OTP?.trim();
  if (!digits || digits.length !== 10 || !code || code.length !== 6) {
    return null;
  }
  return { phone: `+91${digits}`, code };
}
