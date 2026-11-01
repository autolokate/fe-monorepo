'use client';

/**
 * Read-only view of the single website session for the purchase journey (WEB-05). The
 * journey and the marketing pages share one session; see `@/lib/session` for the model.
 */
import { clearSession, getSessionPhone, getSessionTokens, hasSession } from '@/lib/session';

export interface PurchaseSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: string;
  /** E.164 phone the buyer verified with, so we can prefill it on return. */
  phone?: string;
}

export function getPurchaseSession(): PurchaseSession | null {
  if (typeof window === 'undefined') return null;
  const pair = getSessionTokens().read();
  if (!pair) return null;
  const phone = getSessionPhone();
  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    expiresAt: pair.expiresAt,
    userId: pair.userId,
    ...(phone ? { phone } : {}),
  };
}

export function getPurchaseToken(): string | null {
  return getPurchaseSession()?.accessToken ?? null;
}

/** True while the access token is inside its lifetime (with the TokenManager's buffer). */
export function isAccessTokenLive(): boolean {
  if (typeof window === 'undefined') return false;
  const tokens = getSessionTokens();
  return tokens.hasSession() && !tokens.isExpired();
}

/** Signed in = we hold a token pair (a lapsed access token is rotated on demand). */
export function isPurchaseAuthenticated(): boolean {
  return hasSession();
}

export function clearPurchaseSession(): void {
  clearSession();
}
