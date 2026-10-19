import { wireTokenRefresh } from '@autolokate/api-client';
import { getTokenManager } from '@autolokate/auth';

import { getQrBootstrapClient } from '@/platform/api/qr-api-client';

import { revokeAndClearAuthSession } from './auth-session';

export type AuthSessionValidity = 'valid' | 'logged_out';

/**
 * Ensure access token is usable — refresh when expired.
 * Clears local session when refresh fails (both tokens exhausted).
 *
 * Wires the bootstrap refresh handler before rotating so cold start
 * (AppLaunchSplash / AuthRoutes) can refresh without waiting for an
 * authenticated API call to construct getQrApiClient().
 */
export async function ensureValidAuthSession(): Promise<AuthSessionValidity> {
  const tokenManager = getTokenManager();
  if (!tokenManager.hasSession()) {
    return 'logged_out';
  }

  if (!tokenManager.isExpired()) {
    return 'valid';
  }

  wireTokenRefresh(tokenManager, getQrBootstrapClient());

  const refreshed = await tokenManager.refresh();
  if (refreshed) {
    return 'valid';
  }

  await revokeAndClearAuthSession();
  return 'logged_out';
}

/** True when bearer tokens are present (may still be expired). */
export function hasAuthTokens(): boolean {
  return getTokenManager().hasSession();
}
