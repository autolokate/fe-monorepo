'use client';

import { requestPurchaseOtp, verifyPurchaseOtp, type VerifyOtpResult } from '@/services/otp';
import {
  clearPurchaseSession,
  getProfile,
  getPurchaseSession,
  grantAccountConsent,
  isPurchaseAuthenticated,
  logoutPurchase,
  refreshPurchaseSession,
  updateProfile,
  type Profile,
} from '@/services/purchase';
import { dedupedRequest, invalidateDedupeCache } from '@/lib/api/dedupe-cache';

/** Country dialling code the journey supports (India only, for now). */
export const COUNTRY_CODE = '+91';

/** Cache the buyer's profile so the header GET runs once per journey, not per page. */
const PROFILE_CACHE_KEY = 'purchase-journey:profile';
const PROFILE_TTL_MS = 10 * 60_000;

export type { Profile } from '@/services/purchase';

/** `GET /v1/profile` — deduped + TTL-cached so the header reads it cheaply. */
export function getJourneyProfile(): Promise<Profile> {
  return dedupedRequest(PROFILE_CACHE_KEY, PROFILE_TTL_MS, getProfile);
}

/** 10-digit local number → E.164 (e.g. "9876543210" → "+919876543210"). */
export function toE164(mobile10: string): string {
  return `${COUNTRY_CODE}${mobile10}`;
}

/** E.164 → 10-digit local number, or "" if it doesn't match our country code. */
export function fromE164(phone: string | undefined): string {
  if (phone?.startsWith(COUNTRY_CODE)) return phone.slice(COUNTRY_CODE.length);
  return '';
}

/**
 * Journey auth facade over the existing purchase OTP/session services, so the
 * new flow has a single co-located entry point. Send + verify hit the same
 * `/v1/auth/otp/*` endpoints as the legacy flow and verify stashes the bearer
 * as the purchase session (used by the later cart / pay steps).
 */
export function sendJourneyOtp(mobile10: string): Promise<void> {
  return requestPurchaseOtp({ phone: toE164(mobile10) });
}

export function verifyJourneyOtp(mobile10: string, code: string): Promise<VerifyOtpResult> {
  return verifyPurchaseOtp({ phone: toE164(mobile10), code });
}

/**
 * `PATCH /v1/profile` — capture the buyer's name after they verify. Busts the
 * cached profile so the next `getJourneyProfile` (header GET) returns the fresh
 * name.
 */
export async function saveJourneyProfileName(name: string): Promise<Profile> {
  const profile = await updateProfile({ name });
  invalidateDedupeCache(PROFILE_CACHE_KEY);
  return profile;
}

/**
 * Sign the buyer out of the purchase journey: revoke the session on the backend
 * (`POST /v1/auth/logout`, best-effort), then drop the local session + cached
 * profile. Resolves once teardown is complete; the local session is always
 * cleared even if the network call fails.
 */
export async function signOutJourney(): Promise<void> {
  try {
    await logoutPurchase();
  } finally {
    clearPurchaseSession();
    invalidateDedupeCache(PROFILE_CACHE_KEY);
  }
}

export {
  grantAccountConsent as grantJourneyConsent,
  getPurchaseSession,
  isPurchaseAuthenticated,
  refreshPurchaseSession,
};
