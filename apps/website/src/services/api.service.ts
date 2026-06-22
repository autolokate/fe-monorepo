import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

import { env } from "@/config/env.config";
import { endpoints } from "@/lib/api/endpoints";
import { toApiError } from "@/lib/api/error";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from "@/lib/auth/constants";
import { clearAuthTokens, writeAuthTokens } from "@/lib/auth/storage";

export const BASE_URL = env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL;

/** Cookie name aligned with Autolokate (`src/lib/auth/constants.ts`). */
export const ACCESS_TOKEN_COOKIE = ACCESS_TOKEN_COOKIE_KEY;

// ─── Axios augmentation ─────────────────────────────────────────────
// Add a couple of per-request flags so callers can opt out of auth or
// disable the refresh-on-401 dance for endpoints where it would loop.

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Attach Authorization header from cookie. Default: true. */
    withAuth?: boolean;
    /** Disable the 401 → refresh → replay cycle. Default: true. */
    retryOnAuthFailure?: boolean;
    /** Internal flag set by the interceptor to break refresh loops. */
    _retried?: boolean;
  }
}

// ─── Shared axios instance ──────────────────────────────────────────
// One instance for the whole app: interceptors register once, connection
// pooling is reused, and per-call config is layered on top.

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

apiInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers ?? {});

  if (config.withAuth !== false) {
    const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  config.headers = headers;
  return config;
});

// ─── Refresh-on-401 ─────────────────────────────────────────────────

function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Pull a fresh access token out of any shape the refresh endpoint returns. */
function pickAccessToken(payload: unknown): string | null {
  if (!isRec(payload)) return null;
  if (typeof payload.access_token === "string") return payload.access_token;
  if (isRec(payload.data)) {
    if (typeof payload.data.access_token === "string") return payload.data.access_token;
    if (
      isRec(payload.data.session) &&
      typeof payload.data.session.access_token === "string"
    ) {
      return payload.data.session.access_token;
    }
  }
  if (isRec(payload.session) && typeof payload.session.access_token === "string") {
    return payload.session.access_token;
  }
  return null;
}

/** Single in-flight refresh — concurrent 401s all wait on the same promise. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE_KEY);
  if (!refreshToken) return null;

  try {
    // Bare axios call — bypasses our interceptors so it can't recurse.
    const response = await axios.post<unknown>(`${BASE_URL}${endpoints.auth.refresh}`, {
      refresh_token: refreshToken,
    });
    const nextAccessToken = pickAccessToken(response.data);
    if (!nextAccessToken) return null;

    writeAuthTokens({ accessToken: nextAccessToken, refreshToken });
    return nextAccessToken;
  } catch {
    return null;
  }
}

function handleAuthFailureRedirect(): void {
  clearAuthTokens();
  if (typeof window === "undefined") return;
  // Already on home or the auth pages — nothing to do.
  const path = window.location.pathname;
  if (path === "/" || path.startsWith("/auth/")) return;
  // For everything else, bounce to home. The auth-change event will refresh
  // any mounted hooks, and the Log in CTA in the header is still accessible.
  window.location.replace("/");
}

apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig | undefined;
    const status = error.response?.status;

    const wantsAuth = config?.withAuth !== false;
    const retryEnabled = config?.retryOnAuthFailure !== false;

    if (status === 401 && wantsAuth && retryEnabled && !config?._retried) {
      refreshInFlight = refreshInFlight ?? refreshAccessToken();
      const next = await refreshInFlight;
      refreshInFlight = null;

      if (next && config) {
        return apiInstance.request({
          ...config,
          _retried: true,
          headers: { ...(config.headers ?? {}), Authorization: `Bearer ${next}` },
        });
      }
      handleAuthFailureRedirect();
    } else if (status === 401 && wantsAuth) {
      handleAuthFailureRedirect();
    }

    return Promise.reject(toApiError(error));
  },
);

// ─── Public surface ─────────────────────────────────────────────────

interface Config extends Omit<AxiosRequestConfig, "url" | "method" | "data"> {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/**
 * Singleton API gateway used by every service in the app.
 * - Auth header attached from cookie by default; pass `{ withAuth: false }` to opt out.
 * - Failures throw `ApiError` with a normalised `{ message, status, data }`.
 * - 401 triggers an automatic refresh + replay (one attempt, deduplicated).
 *
 * @example
 *   const res = await ApiService.post<VerifyOtpResponse>("/v1/auth/verify-otp", body);
 */
export const ApiService = {
  get: <T = unknown>(endpoint: string, config: Config = {}) =>
    apiInstance.get<T>(endpoint, config),

  post: <T = unknown>(endpoint: string, data?: unknown, config: Config = {}) =>
    apiInstance.post<T>(endpoint, data, config),

  put: <T = unknown>(endpoint: string, data?: unknown, config: Config = {}) =>
    apiInstance.put<T>(endpoint, data, config),

  patch: <T = unknown>(endpoint: string, data?: unknown, config: Config = {}) =>
    apiInstance.patch<T>(endpoint, data, config),

  delete: <T = unknown>(endpoint: string, config: Config = {}) =>
    apiInstance.delete<T>(endpoint, config),
};

/** Direct access to the shared axios instance for niche cases (e.g. uploading FormData). */
export { apiInstance };
