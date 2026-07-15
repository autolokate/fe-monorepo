'use client';

import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { endpoints } from '@/lib/api/endpoints';
import { toApiError } from '@/lib/api/error';
import {
  clearPurchaseSession,
  getPurchaseSession,
  getPurchaseToken,
  isAccessTokenLive,
  setPurchaseSession,
} from './session';

/**
 * Temporary override — the purchase backend (plans, cart, orders, auth) lives on
 * a separate host for now, so this client targets it directly instead of the
 * shared staging base URL. Remove once these routes are served from
 * `NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL`.
 */
export const PURCHASE_API_BASE_URL = 'https://malisa-noninclusive-davin.ngrok-free.dev';

/**
 * Dedicated axios instance for the purchase flow. It's intentionally isolated
 * from the app-wide `ApiService` so it can attach the purchase-scoped bearer
 * token (see `session.ts`) without touching — or being touched by — the
 * marketing site's cookie auth + refresh-on-401 machinery.
 */
const client = axios.create({
  baseURL: PURCHASE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // ngrok's free tier serves an HTML interstitial without this header, which
    // would break JSON parsing.
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30_000,
});

client.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers ?? {});
  const token = getPurchaseToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('ngrok-skip-browser-warning', 'true');
  config.headers = headers;
  return config;
});

// ─── Silent refresh ──────────────────────────────────────────────────
// The access token only lives ~15 min. Rather than force a fresh OTP, we trade
// the long-lived refresh token for a new access token — on demand (proactively
// before a call) and reactively (when a call 401s). A single in-flight promise
// dedupes concurrent callers so we only hit `/v1/auth/refresh` once.

interface RefreshResult {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresAt?: string;
  expires_at?: string;
  userId?: string;
  user_id?: string;
}

let refreshInFlight: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const current = getPurchaseSession();
  if (!current?.refreshToken) return null;

  try {
    // Bare axios (not `client`) so this call never re-enters the interceptor.
    const res = await axios.post<{ data?: RefreshResult } & RefreshResult>(
      `${PURCHASE_API_BASE_URL}${endpoints.auth.refresh}`,
      // Backend rejects unknown props — send only the camelCase key it expects.
      { refreshToken: current.refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        timeout: 30_000,
      },
    );

    const body = res.data ?? {};
    const data: RefreshResult = body.data ?? body;
    const accessToken = data.accessToken ?? data.access_token;
    if (!accessToken) throw new Error('No access token in refresh response');

    setPurchaseSession({
      accessToken,
      // The backend may or may not rotate the refresh token — keep the old one
      // if it doesn't send a new one.
      refreshToken: data.refreshToken ?? data.refresh_token ?? current.refreshToken,
      expiresAt: data.expiresAt ?? data.expires_at,
      userId: data.userId ?? data.user_id ?? current.userId,
      phone: current.phone,
    });
    return accessToken;
  } catch {
    // Refresh token is dead / rejected — drop the session so the buyer is sent
    // back through the OTP step on their next attempt.
    clearPurchaseSession();
    return null;
  }
}

/**
 * Ensure we hold a usable access token, minting a new one from the refresh
 * token when the current one is missing or (near) expired. Returns the token,
 * or `null` when the buyer needs to log in again. Safe to call concurrently.
 */
export async function refreshPurchaseSession(): Promise<string | null> {
  if (isAccessTokenLive()) return getPurchaseToken();
  refreshInFlight = refreshInFlight ?? doRefresh();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const status = error?.response?.status;

    // One shot: on a 401, try a silent refresh and replay the original request.
    if (status === 401 && config && !config._retried && getPurchaseSession()?.refreshToken) {
      config._retried = true;
      const token = await refreshPurchaseSession();
      if (token) {
        const headers = AxiosHeaders.from(config.headers ?? {});
        headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
        return client.request(config);
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export const PurchaseApi = {
  get: <T = unknown>(endpoint: string, config: AxiosRequestConfig = {}) =>
    client.get<T>(endpoint, config),
  post: <T = unknown>(endpoint: string, data?: unknown, config: AxiosRequestConfig = {}) =>
    client.post<T>(endpoint, data, config),
  patch: <T = unknown>(endpoint: string, data?: unknown, config: AxiosRequestConfig = {}) =>
    client.patch<T>(endpoint, data, config),
  delete: <T = unknown>(endpoint: string, config: AxiosRequestConfig = {}) =>
    client.delete<T>(endpoint, config),
};

/** Fresh idempotency key for order create / pay (backend dedupes retries on it). */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older runtimes.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
