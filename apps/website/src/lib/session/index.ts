/**
 * The website's ONE session model (WEB-02 / WEB-05).
 *
 * - Tokens come only from the Nest auth contract (`POST /v1/auth/otp/verify`, rotated by
 *   `POST /v1/auth/refresh` with a camelCase `{ refreshToken }` body).
 * - They are held by the shared `@autolokate/auth` `TokenManager` (single-flight refresh,
 *   rotated pair persisted) in **sessionStorage** — the same model the Admin console and the
 *   QR PWA use. No cookies and no localStorage: nothing long-lived survives the tab, and a
 *   refresh token is never shared between tabs (two tabs rotating the same token would trip
 *   the backend's reuse detection and revoke the whole family).
 * - Nothing server-rendered needs the session today (every authenticated surface is a client
 *   component), so there is deliberately no auth cookie. If SSR ever needs it, add a BFF route
 *   that keeps the refresh token in an HttpOnly cookie — do not reintroduce JS-readable cookies.
 *
 * The marketing pages (login / profile / book-session) and the purchase journey
 * (`/buy` → checkout → orders) all read this same session.
 */
import { createApiClient, wireTokenRefresh } from '@autolokate/api-client';
import {
  TokenManager,
  createSessionTokenStorage,
  type StoredTokenPair,
  type TokenStorage,
} from '@autolokate/auth';

import { env } from '@/config/env.config';
import { fetchWithTimeout } from '@/lib/api/fetch';

/** sessionStorage key for the token pair. Website-specific so it never collides with other apps. */
export const SESSION_STORAGE_KEY = 'al-website-auth-v1';
/** sessionStorage key for the verified phone (non-secret; used only to prefill forms). */
export const SESSION_PHONE_KEY = 'al-website-phone-v1';
/** Same-tab DOM event fired whenever the session is written or cleared. */
export const SESSION_CHANGE_EVENT = 'autolokate:session-change';

/** Legacy stores from the pre-consolidation website — purged (or migrated) on first load. */
const LEGACY_LOCAL_KEYS = [
  'autolokate_access_token',
  'autolokate_refresh_token',
  'autolokate:purchase-session',
] as const;
const LEGACY_COOKIES = ['autolokate_access_token', 'autolokate_refresh_token'] as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function notifySessionChange(): void {
  if (!isBrowser() || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  } catch {
    // Non-DOM environments (tests, very old webviews) — nothing to notify.
  }
}

function safeSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** Token storage that also broadcasts changes so hooks can re-render. */
function createObservedStorage(): TokenStorage {
  const inner = createSessionTokenStorage(SESSION_STORAGE_KEY);
  return {
    read: () => inner.read(),
    write: (tokens) => {
      inner.write(tokens);
      notifySessionChange();
    },
    remove: () => {
      inner.remove();
      safeSessionStorage()?.removeItem(SESSION_PHONE_KEY);
      notifySessionChange();
    },
  };
}

/**
 * Move a still-valid purchase session from the old localStorage store into the new
 * session store (so a buyer mid-checkout is not logged out by the deploy), then wipe every
 * legacy token store — including the JS-readable 30-day cookies.
 */
export function migrateLegacySession(tokens: TokenManager): void {
  if (!isBrowser()) return;
  let legacyStore: Storage | null = null;
  try {
    legacyStore = typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    legacyStore = null;
  }
  if (legacyStore) {
    try {
      const raw = legacyStore.getItem('autolokate:purchase-session');
      if (raw && !tokens.hasSession()) {
        const legacy = JSON.parse(raw) as Partial<StoredTokenPair> & { phone?: string };
        if (legacy.accessToken && legacy.refreshToken) {
          tokens.save({
            accessToken: legacy.accessToken,
            refreshToken: legacy.refreshToken,
            // Unknown expiry → treat as expired so the first call rotates it.
            expiresAt: legacy.expiresAt ?? new Date(0).toISOString(),
            userId: legacy.userId ?? '',
          });
          if (legacy.phone) safeSessionStorage()?.setItem(SESSION_PHONE_KEY, legacy.phone);
        }
      }
    } catch {
      // Corrupt legacy blob — just drop it below.
    }
    for (const key of LEGACY_LOCAL_KEYS) {
      try {
        legacyStore.removeItem(key);
      } catch {
        // ignore
      }
    }
  }
  if (typeof document !== 'undefined') {
    for (const name of LEGACY_COOKIES) {
      document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
    }
  }
}

let manager: TokenManager | null = null;

/** The process-wide (per-tab) token manager. */
export function getSessionTokens(): TokenManager {
  if (!manager) {
    manager = new TokenManager(createObservedStorage());
    // Rotation goes through a bare client (no token manager, no bearer) so a refresh can
    // never recurse into another refresh. Wired here so `ensureFreshAccessToken` works
    // before any other API call has been made in this tab.
    wireTokenRefresh(
      manager,
      createApiClient({
        baseUrl: env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL,
        fetch: fetchWithTimeout,
      }),
    );
    migrateLegacySession(manager);
  }
  return manager;
}

/** Test seam: drop the singleton so the next call rebuilds it from storage. */
export function resetSessionForTests(): void {
  manager = null;
}

/** Persist a freshly verified token pair (and the phone it was verified with). */
export function saveSession(tokens: StoredTokenPair, phone?: string): void {
  if (phone) safeSessionStorage()?.setItem(SESSION_PHONE_KEY, phone);
  getSessionTokens().save(tokens);
}

/** Drop the local session (callers revoke server-side first — see `signOut`). */
export function clearSession(): void {
  getSessionTokens().clear();
}

/** True when we hold a token pair (a lapsed access token is renewed on demand). */
export function hasSession(): boolean {
  if (!isBrowser()) return false;
  return getSessionTokens().hasSession();
}

/** The E.164 phone the session was verified with, if known. */
export function getSessionPhone(): string | null {
  return safeSessionStorage()?.getItem(SESSION_PHONE_KEY) ?? null;
}

/**
 * Return a usable access token, rotating the refresh token first when the access token is
 * missing/expired (or always, with `force`). Concurrent callers share one refresh.
 * Resolves `null` when the session is gone and the user must sign in again.
 */
export async function ensureFreshAccessToken(force = false): Promise<string | null> {
  const tokens = getSessionTokens();
  if (!tokens.hasSession()) return null;
  if (force || tokens.isExpired()) {
    const ok = await tokens.refresh();
    if (!ok) return tokens.hasSession() ? tokens.getAccessToken() : null;
  }
  return tokens.getAccessToken();
}

/** Subscribe to session changes in this tab. Returns an unsubscribe function. */
export function subscribeSession(handler: () => void): () => void {
  if (!isBrowser() || typeof window.addEventListener !== 'function') return () => {};
  window.addEventListener(SESSION_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, handler);
  };
}
