/**
 * The website's single HTTP stack (WEB-06): the shared `@autolokate/api-client` `ApiClient`
 * wired to the shared `@autolokate/auth` `TokenManager` (see `@/lib/session`).
 *
 * - Bearer attached from the session; `withAuth: false` sends the call anonymously.
 * - A 401 triggers ONE single-flight `POST /v1/auth/refresh` (`{ refreshToken }`), stores the
 *   rotated pair and replays the request once (implemented by the shared client).
 * - Every failure is rethrown as the website `ApiError` (message/status/code).
 *
 * `http.get/post/...` return `{ data }` (the parsed JSON body) so service modules read
 * `res.data` exactly as before the axios removal.
 */
import { createApiClient, type ApiClient } from '@autolokate/api-client';

import { env } from '@/config/env.config';
import { getSessionTokens } from '@/lib/session';

import { toApiError } from './error';
import { fetchWithTimeout } from './fetch';

export { REQUEST_TIMEOUT_MS } from './fetch';

export const API_BASE_URL = env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL;

let client: ApiClient | null = null;

/** The shared, session-aware API client (one per tab). */
export function getApiClient(): ApiClient {
  if (client) return client;
  // The session's TokenManager already carries the refresh handler (see `@/lib/session`).
  const tokens = getSessionTokens();
  client = createApiClient({
    baseUrl: API_BASE_URL,
    fetch: fetchWithTimeout,
    tokenManager: tokens,
    getAccessToken: () => tokens.getAccessToken(),
    // The TokenManager already cleared the pair if the refresh token was rejected (and
    // the session-change event re-renders guards/headers). A transient refresh failure
    // keeps the session, so there is nothing else to do here.
    onAuthFailure: () => undefined,
  });
  return client;
}

/** Test seam: rebuild the client (e.g. after resetting the session singleton). */
export function resetApiClientForTests(): void {
  client = null;
}

type Primitive = string | number | boolean;

export interface HttpConfig {
  /** Query parameters; `undefined`/`null`/'' values are dropped. Arrays repeat the key. */
  params?: Record<string, Primitive | Primitive[] | null | undefined>;
  headers?: Record<string, string>;
  /** Attach the session bearer (and refresh on 401). Default: true. */
  withAuth?: boolean;
  signal?: AbortSignal;
}

export interface HttpResponse<T> {
  data: T;
}

export function withQuery(endpoint: string, params?: HttpConfig['params']): string {
  if (!params) return endpoint;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  if (!qs) return endpoint;
  return `${endpoint}${endpoint.includes('?') ? '&' : '?'}${qs}`;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function send<T>(
  method: Method,
  endpoint: string,
  body: unknown,
  config: HttpConfig = {},
): Promise<HttpResponse<T>> {
  const anonymous = config.withAuth === false;
  try {
    const data = await getApiClient().request<T>(withQuery(endpoint, config.params), {
      method,
      ...(body !== undefined ? { body } : {}),
      ...(config.headers ? { headers: config.headers } : {}),
      ...(config.signal ? { signal: config.signal } : {}),
      skipAuth: anonymous,
      skipAuthRetry: anonymous,
    });
    return { data };
  } catch (err) {
    throw toApiError(err);
  }
}

/** Website HTTP facade over the shared client. */
export const http = {
  get: <T = unknown>(endpoint: string, config?: HttpConfig) =>
    send<T>('GET', endpoint, undefined, config),
  post: <T = unknown>(endpoint: string, data?: unknown, config?: HttpConfig) =>
    send<T>('POST', endpoint, data, config),
  put: <T = unknown>(endpoint: string, data?: unknown, config?: HttpConfig) =>
    send<T>('PUT', endpoint, data, config),
  patch: <T = unknown>(endpoint: string, data?: unknown, config?: HttpConfig) =>
    send<T>('PATCH', endpoint, data, config),
  delete: <T = unknown>(endpoint: string, config?: HttpConfig) =>
    send<T>('DELETE', endpoint, undefined, config),
};

/** Fresh idempotency key for order create / pay (backend dedupes retries on it). */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
