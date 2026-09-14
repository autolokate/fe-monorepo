import {
  createApiClient,
  createAuthenticatedApiClient,
  wireTokenRefresh,
  type ApiClient,
} from '@autolokate/api-client';
import { getTokenManager } from '@autolokate/auth';

import { env } from '@/config/env';

const REQUEST_TIMEOUT_MS = 10_000;

let bootstrapClient: ApiClient | null = null;
let authenticatedClient: ApiClient | null = null;
let authFailureHandler: (() => void) | null = null;

/** Register a callback when refresh fails and tokens are cleared (e.g. redirect to login). */
export function setQrAuthFailureHandler(handler: (() => void) | null): void {
  authFailureHandler = handler;
}

/** Public / bootstrap client — OTP, refresh, legal docs. No auth retry loop. */
export function getQrBootstrapClient(): ApiClient {
  if (!bootstrapClient) {
    bootstrapClient = createApiClient({
      baseUrl: env.apiBaseUrl,
      fetch: qrFetch,
    });
  }
  return bootstrapClient;
}

/** Authenticated client — bearer injection + single-queue refresh on 401. */
export function getQrApiClient(): ApiClient {
  if (!authenticatedClient) {
    const tokenManager = getTokenManager();
    wireTokenRefresh(tokenManager, getQrBootstrapClient());
    authenticatedClient = createAuthenticatedApiClient({
      baseUrl: env.apiBaseUrl,
      tokenManager,
      fetch: qrFetch,
      onAuthFailure: () => {
        authFailureHandler?.();
      },
    });
  }
  return authenticatedClient;
}

async function qrFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('ngrok-skip-browser-warning') && env.apiBaseUrl.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort(new DOMException('Request timed out', 'TimeoutError'));
  }, REQUEST_TIMEOUT_MS);
  const callerSignal = init?.signal;
  const abortFromCaller = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else {
    callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    return await fetch(input, { ...init, headers, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }
}
