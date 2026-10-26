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

export function registerAdminAuthFailureHandler(handler: () => void): void {
  authFailureHandler = handler;
}

export function getAdminBootstrapClient(): ApiClient {
  if (!bootstrapClient) {
    bootstrapClient = createApiClient({
      baseUrl: env.apiBaseUrl,
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
      onAuthFailure: () => {
        authFailureHandler?.();
      },
    });
  }
  return authenticatedClient;
}

export { tokenManager };
