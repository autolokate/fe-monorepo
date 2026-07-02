import type { ApiClient } from './client.js';
import { refreshToken as refreshTokenApi } from './auth.js';

import type { TokenManager, TokenRefreshHandler } from '@autolokate/auth';

/** Attach refresh handler so TokenManager can rotate tokens via POST /v1/auth/refresh. */
export function wireTokenRefresh(
  tokenManager: TokenManager,
  bootstrapClient: ApiClient,
): void {
  const handler: TokenRefreshHandler = async (refreshToken) => {
    return refreshTokenApi(bootstrapClient, { refreshToken });
  };
  tokenManager.setRefreshHandler(handler);
}
