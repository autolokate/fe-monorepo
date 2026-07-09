import { getTokenManager } from '@autolokate/auth';

import type { JourneySession, PersistedJourneyState } from '@/journey/types.js';
import { AUTH_COMPLETED } from '@/features/shared-auth/types.js';

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
 * Clears stale AUTH_COMPLETED when tokens are missing.
 */
export function reconcileAuthSession(state: PersistedJourneyState): Partial<PersistedJourneyState> | null {
  const expectsAuth =
    state.authStatus === AUTH_COMPLETED || state.session.auth?.otpVerified === true;
  if (!expectsAuth) {
    return null;
  }
  if (getTokenManager().hasSession()) {
    return null;
  }
  return createAuthFailureSessionPatch(state.session);
}

/** Session patch applied when refresh fails and tokens are cleared. */
export function createAuthFailureSessionPatch(
  session: JourneySession,
): Pick<PersistedJourneyState, 'authStatus' | 'session'> {
  return {
    authStatus: 'pending',
    session: {
      ...session,
      auth: {
        ...session.auth,
        otpVerified: false,
      },
    },
  };
}
