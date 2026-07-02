import { getTokenManager } from '@autolokate/auth';

import type { JourneySession } from '@/journey/types.js';

import { logout } from './auth-service.js';

/** Clear in-memory and persisted auth tokens only. */
export function clearLocalAuthSession(): void {
  getTokenManager().clear();
}

/** Revoke server session when possible, then clear local tokens. */
export async function revokeAndClearAuthSession(): Promise<void> {
  await logout();
}

/**
 * Align journey auth flags with token presence after reload.
 * Returns a session patch when stale `otpVerified` must be cleared.
 */
export function reconcileAuthSession(session: JourneySession): Partial<JourneySession> | null {
  const otpVerified = session.auth?.otpVerified === true;
  if (!otpVerified) {
    return null;
  }
  if (getTokenManager().hasSession()) {
    return null;
  }
  return {
    auth: {
      ...session.auth,
      otpVerified: false,
    },
  };
}

/** Session patch applied when refresh fails and tokens are cleared. */
export function createAuthFailureSessionPatch(session: JourneySession): Partial<JourneySession> {
  return {
    auth: {
      ...session.auth,
      otpVerified: false,
    },
  };
}
