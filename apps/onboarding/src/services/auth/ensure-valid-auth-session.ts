import { getTokenManager } from '@autolokate/auth';

import { revokeAndClearAuthSession } from './auth-session.js';

export type AuthSessionValidity = 'valid' | 'logged_out';

/**
 * Ensure access token is usable — refresh when expired.
 * Clears local session when refresh fails (both tokens exhausted).
 */
export async function ensureValidAuthSession(): Promise<AuthSessionValidity> {
  const tokenManager = getTokenManager();
  if (!tokenManager.hasSession()) {
    return 'logged_out';
  }

  if (!tokenManager.isExpired()) {
    return 'valid';
  }

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
