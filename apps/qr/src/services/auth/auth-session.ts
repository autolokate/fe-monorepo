import { getTokenManager } from '@autolokate/auth';

import type { JourneySession, PersistedJourneyState } from '@/journey/types';
import { AUTH_COMPLETED } from '@/features/shared-auth/types';

import { logout } from './auth-service';

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
 * Restores AUTH_COMPLETED when tokens exist; clears stale flags when tokens are gone.
 */
export function reconcileAuthSession(
  state: PersistedJourneyState,
): Partial<PersistedJourneyState> | null {
  const hasTokens = getTokenManager().hasSession();

  if (hasTokens && state.authStatus !== AUTH_COMPLETED) {
    if (state.session.auth?.otpVerified || state.session.auth?.mobile) {
      return { authStatus: AUTH_COMPLETED };
    }
  }

  const expectsAuth =
    state.authStatus === AUTH_COMPLETED || state.session.auth?.otpVerified === true;
  if (!expectsAuth) {
    return null;
  }
  if (hasTokens) {
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
