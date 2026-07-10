import type { TokenManager } from '@autolokate/auth';

import { endpoints } from './endpoints';
import { readEnvelopeMeta } from './envelope';

export type ApiClientConfig = {
  baseUrl: string;
  getAccessToken?: () => string | null;
  fetch?: typeof fetch;
  /** When set, 401 responses trigger a single queued refresh + retry. */
  tokenManager?: TokenManager;
  onAuthFailure?: () => void;
};

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Do not attach bearer token (public endpoints). */
  skipAuth?: boolean;
  /** Do not attempt refresh + retry on 401. */
  skipAuthRetry?: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly details: unknown;

  constructor(message: string, status: number, code: string | null = null, details: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

import type { ApiErrorEnvelope } from './envelope';

type ErrorBody = {
  message?: string;
  code?: string;
  details?: unknown;
};

const AUTH_PUBLIC_PATHS = new Set<string>([
  endpoints.auth.requestOtp,
  endpoints.auth.verifyOtp,
  endpoints.auth.refresh,
  endpoints.legal.documents,
]);

function isAuthPublicPath(path: string): boolean {
  if (AUTH_PUBLIC_PATHS.has(path)) {
    return true;
  }
  return path.startsWith('/v1/activation/preview');
}

/**
 * Typed HTTP client for Autolokate backend APIs.
 * Supports bearer injection, refresh-on-401 (single queue), and envelope errors.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => string | null;
  private readonly fetchImpl: typeof fetch;
  private readonly tokenManager: TokenManager | undefined;
  private readonly onAuthFailure: (() => void) | undefined;
  private correlationId: string | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getAccessToken = config.getAccessToken ?? (() => null);
    this.fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
    this.tokenManager = config.tokenManager;
    this.onAuthFailure = config.onAuthFailure;
  }

  get endpoints() {
    return endpoints;
  }

  async get<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * GET a non-JSON body (e.g. CSV export). Uses the same auth/refresh path as
   * {@link request}, but returns a Blob + optional filename from Content-Disposition.
   */
  async getBlob(
    path: string,
    options: Omit<ApiRequestOptions, 'method' | 'body'> & { accept?: string } = {},
  ): Promise<{ blob: Blob; filename: string | null }> {
    const { accept = 'application/octet-stream', headers = {}, signal, skipAuth = false, skipAuthRetry = false } =
      options;
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const token = skipAuth ? null : this.getAccessToken();
    const requestInit: RequestInit = {
      method: 'GET',
      headers: {
        Accept: accept,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(this.correlationId ? { 'X-Correlation-Id': this.correlationId } : {}),
        ...headers,
      },
      ...(signal !== undefined ? { signal } : {}),
    };

    let response = await this.fetchImpl(url, requestInit);

    if (response.status === 401 && !skipAuthRetry && this.shouldAttemptRefresh(path)) {
      const refreshed = await this.tokenManager?.refresh();
      if (refreshed) {
        const retryToken = this.getAccessToken();
        response = await this.fetchImpl(url, {
          ...requestInit,
          headers: {
            ...requestInit.headers,
            ...(retryToken ? { Authorization: `Bearer ${retryToken}` } : {}),
          },
        });
      } else {
        this.onAuthFailure?.();
      }
    }

    if (!response.ok) {
      throw await this.parseError(response);
    }

    const disposition = response.headers.get('Content-Disposition');
    const filenameMatch = disposition?.match(/filename="([^"]+)"/i);
    return {
      blob: await response.blob(),
      filename: filenameMatch?.[1] ?? null,
    };
  }

  async post<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  async put<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  async delete<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  async request<T>(path: string, options: ApiRequestOptions = {}, isRetry = false): Promise<T> {
    const { method = 'GET', body, headers = {}, signal, skipAuth = false, skipAuthRetry = false } =
      options;
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const token = skipAuth ? null : this.getAccessToken();
    const requestInit: RequestInit = {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(this.correlationId ? { 'X-Correlation-Id': this.correlationId } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal !== undefined ? { signal } : {}),
    };

    const response = await this.fetchImpl(url, requestInit);

    if (response.status === 401 && !isRetry && !skipAuthRetry && this.shouldAttemptRefresh(path)) {
      const refreshed = await this.tokenManager?.refresh();
      if (refreshed) {
        return this.request<T>(path, options, true);
      }
      this.onAuthFailure?.();
    }

    if (!response.ok) {
      throw await this.parseError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const json = (await response.json()) as T;
    const meta = readEnvelopeMeta(json);
    if (meta?.correlationId) {
      this.correlationId = meta.correlationId;
    }
    return json;
  }

  private shouldAttemptRefresh(path: string): boolean {
    if (!this.tokenManager) {
      return false;
    }
    if (isAuthPublicPath(path) || path === endpoints.auth.refresh) {
      return false;
    }
    return true;
  }

  private async parseError(response: Response): Promise<ApiError> {
    let body: ErrorBody | ApiErrorEnvelope | null = null;

    try {
      body = (await response.json()) as ErrorBody | ApiErrorEnvelope;
    } catch {
      body = null;
    }

    if (body && typeof body === 'object' && 'error' in body) {
      const nested = body.error;
      return new ApiError(
        nested.message || `Request failed with status ${String(response.status)}`,
        response.status,
        nested.code,
        nested,
      );
    }

    const flat = body;

    return new ApiError(
      flat?.message ?? `Request failed with status ${String(response.status)}`,
      response.status,
      flat?.code ?? null,
      flat?.details ?? null,
    );
  }
}

/** Create a preconfigured API client instance. */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

/**
 * Authenticated client with refresh-on-401 wired to TokenManager.
 * Call `wireTokenRefresh` once before use to attach the refresh handler.
 */
export function createAuthenticatedApiClient(
  config: Omit<ApiClientConfig, 'getAccessToken' | 'tokenManager'> & {
    tokenManager: TokenManager;
  },
): ApiClient {
  const { tokenManager, onAuthFailure, ...rest } = config;
  return createApiClient({
    ...rest,
    tokenManager,
    getAccessToken: () => tokenManager.getAccessToken(),
    onAuthFailure: () => {
      tokenManager.clear();
      onAuthFailure?.();
    },
  });
}
