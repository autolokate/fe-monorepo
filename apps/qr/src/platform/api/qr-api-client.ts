import {
  createApiClient,
  createAuthenticatedApiClient,
  wireTokenRefresh,
  type ApiClient,
} from '@autolokate/api-client';
import { getTokenManager } from '@autolokate/auth';

import { env } from '@/config/env';

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
      onAuthFailure: () => {
        authFailureHandler?.();
      },
    });
  }
  return authenticatedClient;
}
