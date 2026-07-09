import {
  createApiClient,
  createAuthenticatedApiClient,
  wireTokenRefresh,
  type ApiClient,
} from '@autolokate/api-client';
import { createTokenManager, createSessionTokenStorage } from '@autolokate/auth';

import { env } from '@/config/env';

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

let bootstrapClient: ApiClient | null = null;
let authenticatedClient: ApiClient | null = null;
let authFailureHandler: (() => void) | null = null;

const tokenManager = createTokenManager(createSessionTokenStorage(ADMIN_TOKEN_KEY));

function createFetchWithNgrok(): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);
    if (env.apiBaseUrl.includes('ngrok')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    return fetch(input, { ...init, headers });
  };
}

export function registerAdminAuthFailureHandler(handler: () => void): void {
  authFailureHandler = handler;
}

export function getAdminBootstrapClient(): ApiClient {
  if (!bootstrapClient) {
    bootstrapClient = createApiClient({
      baseUrl: env.apiBaseUrl,
      fetch: createFetchWithNgrok(),
    });
  }
  return bootstrapClient;
}

export function getAdminApiClient(): ApiClient {
  if (!authenticatedClient) {
    wireTokenRefresh(tokenManager, getAdminBootstrapClient());
    authenticatedClient = createAuthenticatedApiClient({
      baseUrl: env.apiBaseUrl,
      tokenManager,
      fetch: createFetchWithNgrok(),
      onAuthFailure: () => {
        authFailureHandler?.();
      },
    });
  }
  return authenticatedClient;
}

export { tokenManager };
