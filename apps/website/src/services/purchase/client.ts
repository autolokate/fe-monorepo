'use client';

/**
 * Purchase-journey transport. There is no separate purchase stack any more (WEB-06): this
 * re-exports the website's single shared-client facade and session helpers under the names
 * the journey already uses.
 */
import { API_BASE_URL, http, newIdempotencyKey } from '@/lib/api/client';
import { ensureFreshAccessToken } from '@/lib/session';
import { signOut } from '@/services/auth';

export const PURCHASE_API_BASE_URL = API_BASE_URL;

/** Same transport as the rest of the site (bearer from the single website session). */
export const PurchaseApi = http;

export { newIdempotencyKey };

/**
 * Ensure a usable access token, rotating the refresh token when the access token is
 * lapsed (or always with `force`, e.g. before a payment retry). `null` = sign in again.
 */
export function refreshPurchaseSession(force = false): Promise<string | null> {
  return ensureFreshAccessToken(force);
}

/** Revoke server-side (best-effort) and clear the local session. */
export function logoutPurchase(): Promise<void> {
  return signOut();
}
