import type { ApiClient } from './client.js';
import { ApiError } from './client.js';
import { endpoints } from './endpoints.js';
import { unwrapEnvelope } from './envelope.js';

export type OtpChannel = 'sms' | 'whatsapp';

export type RequestOtpBody = {
  phone: string;
};

export type RequestOtpResult = {
  channel: OtpChannel;
};

export type VerifyOtpBody = {
  phone: string;
  code: string;
  deviceId?: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  isNewUser?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return null;
}

/** Accept camelCase or snake_case token payloads from the backend envelope. */
export function normalizeTokenPair(data: unknown): TokenPair {
  if (!isRecord(data)) {
    throw new ApiError('Invalid auth token response', 0, 'invalid_response');
  }

  const accessToken = readString(data, 'accessToken', 'access_token');
  const refreshToken = readString(data, 'refreshToken', 'refresh_token');
  const expiresAt = readString(data, 'expiresAt', 'expires_at');
  const userId = readString(data, 'userId', 'user_id');

  if (!accessToken || !refreshToken || !expiresAt || !userId) {
    throw new ApiError('Invalid auth token response: missing token fields', 0, 'invalid_response');
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    userId,
    ...(typeof data['isNewUser'] === 'boolean'
      ? { isNewUser: data['isNewUser'] }
      : typeof data['is_new_user'] === 'boolean'
        ? { isNewUser: data['is_new_user'] }
        : {}),
  };
}

export type RefreshTokenBody = {
  refreshToken: string;
};

export type Profile = {
  name: string | null;
  locale: string;
  photoMediaId: string | null;
};

export type SessionRoles = {
  role: string;
  availableRoles: string[];
  staffId?: string;
  locationId?: string;
  operatorId?: string;
  accessToken?: string;
  expiresAt?: string;
};

/** POST /v1/auth/otp/request */
export async function requestOtp(
  client: ApiClient,
  body: RequestOtpBody,
): Promise<RequestOtpResult> {
  const response = await client.post<unknown>(endpoints.auth.requestOtp, body, { skipAuth: true });
  return unwrapEnvelope(response) as RequestOtpResult;
}

/** POST /v1/auth/otp/verify */
export async function verifyOtp(client: ApiClient, body: VerifyOtpBody): Promise<TokenPair> {
  const response = await client.post<unknown>(endpoints.auth.verifyOtp, body, { skipAuth: true });
  return normalizeTokenPair(unwrapEnvelope(response));
}

/** POST /v1/auth/refresh */
export async function refreshToken(
  client: ApiClient,
  body: RefreshTokenBody,
): Promise<TokenPair> {
  const response = await client.post<unknown>(endpoints.auth.refresh, body, {
    skipAuth: true,
    skipAuthRetry: true,
  });
  return normalizeTokenPair(unwrapEnvelope(response));
}

/** POST /v1/auth/logout */
export async function logoutSession(client: ApiClient): Promise<void> {
  await client.post(endpoints.auth.logout);
}

/** POST /v1/auth/session — read or switch role (omit role to read). */
export async function getOrSwitchSession(
  client: ApiClient,
  body: { role?: string } = {},
): Promise<SessionRoles> {
  const response = await client.post<unknown>(endpoints.auth.session, body);
  return unwrapEnvelope(response) as SessionRoles;
}

/** GET /v1/profile */
export async function getProfile(client: ApiClient): Promise<Profile> {
  const response = await client.get<unknown>(endpoints.auth.profile);
  return unwrapEnvelope(response) as Profile;
}

/** PATCH /v1/profile */
export async function updateProfile(
  client: ApiClient,
  body: Partial<Pick<Profile, 'name' | 'locale' | 'photoMediaId'>>,
): Promise<Profile> {
  const response = await client.patch<unknown>(endpoints.auth.profile, body);
  return unwrapEnvelope(response) as Profile;
}

/** Format a 10-digit Indian mobile as E.164 (+91). */
export function toE164IndianMobile(digits10: string): string {
  const normalized = digits10.replace(/\D/g, '').slice(-10);
  return `+91${normalized}`;
}
