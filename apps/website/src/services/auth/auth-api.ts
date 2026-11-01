'use client';

/**
 * Website account auth over the real Nest contract (WEB-01), via the shared api-client:
 *   POST /v1/auth/otp/request · POST /v1/auth/otp/verify · POST /v1/auth/logout
 *   GET /v1/profiles · PATCH /v1/profile
 * Used by `/auth/login`, `/auth/signup`, `/profile`, `/book-session` AND the purchase journey.
 */
import {
  getProfile as getProfileApi,
  logoutSession,
  requestOtp as requestOtpApi,
  updateProfile as updateProfileApi,
  verifyOtp as verifyOtpApi,
  type OtpChannel,
  type Profile as ApiProfile,
  type TokenPair,
} from '@autolokate/api-client';

import { getApiClient } from '@/lib/api/client';
import { toApiError } from '@/lib/api/error';
import { clearSession, getSessionTokens, saveSession } from '@/lib/session';

/** Owner profile as served by `GET /v1/profiles` (the backend has no phone/email here). */
export type Profile = ApiProfile & { userName?: string | null };

export interface UpdateProfilePayload {
  name?: string;
  locale?: string;
  photoMediaId?: string;
}

export interface VerifiedSession {
  userId: string;
  isNewUser: boolean;
}

/** `+91XXXXXXXXXX` (E.164) — the backend DTO rejects anything else. */
export const E164_PHONE = /^\+[1-9]\d{7,14}$/;

async function call<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw toApiError(err);
  }
}

/** POST /v1/auth/otp/request — sends a one-time code to an E.164 phone. */
export function requestOtp(phone: string, channel?: OtpChannel): Promise<{ channel: OtpChannel }> {
  return call(() => requestOtpApi(getApiClient(), { phone, ...(channel ? { channel } : {}) }));
}

/**
 * POST /v1/auth/otp/verify — exchanges the code for a token pair and stores it as THE
 * website session (sessionStorage via the shared TokenManager).
 */
export async function verifyOtp(phone: string, code: string): Promise<VerifiedSession> {
  const pair: TokenPair = await call(() => verifyOtpApi(getApiClient(), { phone, code }));
  saveSession(
    {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      expiresAt: pair.expiresAt,
      userId: pair.userId,
    },
    phone,
  );
  return { userId: pair.userId, isNewUser: pair.isNewUser ?? false };
}

/** GET /v1/profiles — the signed-in account's profile. */
export function fetchProfile(): Promise<Profile> {
  return call(() => getProfileApi(getApiClient()));
}

/** PATCH /v1/profile — only non-blank fields are sent (the DTO whitelists the rest away). */
export function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const body: UpdateProfilePayload = {};
  if (payload.name?.trim()) body.name = payload.name.trim();
  if (payload.locale?.trim()) body.locale = payload.locale.trim();
  if (payload.photoMediaId?.trim()) body.photoMediaId = payload.photoMediaId.trim();
  return call(() => updateProfileApi(getApiClient(), body));
}

/**
 * Sign out everywhere this tab knows about: revoke the refresh family server-side
 * (`POST /v1/auth/logout`, best-effort — it needs the bearer, so it runs first), then
 * always drop the local session.
 */
export async function signOut(): Promise<void> {
  try {
    if (getSessionTokens().getAccessToken()) {
      await logoutSession(getApiClient());
    }
  } catch {
    // The local session is cleared regardless.
  } finally {
    clearSession();
  }
}
