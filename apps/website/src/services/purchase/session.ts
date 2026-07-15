'use client';

/**
 * The bearer session for the purchase flow. It's issued by the new backend's
 * `POST /v1/auth/otp/verify` and is scoped to the purchase journey only — kept
 * separate from the marketing site's auth cookies so the two never collide.
 *
 * Held in memory (fast path) and mirrored to `localStorage` so the buyer stays
 * logged in across refreshes, new tabs, and browser restarts — as long as the
 * token hasn't expired they never have to re-enter their phone + OTP.
 */
const STORAGE_KEY = 'autolokate:purchase-session';

export interface PurchaseSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: string;
  /** E.164 phone the buyer verified with, so we can prefill it on return. */
  phone?: string;
}

let cached: PurchaseSession | null = null;

export function setPurchaseSession(session: PurchaseSession | null): void {
  cached = session;
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function getPurchaseSession(): PurchaseSession | null {
  if (cached) return cached;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cached = raw ? (JSON.parse(raw) as PurchaseSession) : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function getPurchaseToken(): string | null {
  return getPurchaseSession()?.accessToken ?? null;
}

/**
 * True while the stored access token is still within its (short) lifetime.
 * The access token from the backend only lives ~15 min, so this flips to
 * false quickly — callers that can renew should use `refreshToken` instead of
 * forcing a re-login.
 */
export function isAccessTokenLive(): boolean {
  const session = getPurchaseSession();
  if (!session?.accessToken) return false;
  if (!session.expiresAt) return true;

  const expiresMs = Date.parse(session.expiresAt);
  if (Number.isNaN(expiresMs)) return true;
  // Treat as expired a little early so a call can't fire mid-flight and 401.
  return expiresMs > Date.now() + 5_000;
}

/**
 * True when the buyer is effectively logged in — i.e. we can talk to the API
 * as them without another OTP. That's the case whenever we hold a refresh
 * token (we can always mint a fresh access token from it), or, failing that,
 * while the access token itself is still live. Used to skip the phone + OTP
 * step.
 */
export function isPurchaseAuthenticated(): boolean {
  const session = getPurchaseSession();
  if (!session?.accessToken) return false;
  if (session.refreshToken) return true;
  return isAccessTokenLive();
}

export function clearPurchaseSession(): void {
  setPurchaseSession(null);
}
