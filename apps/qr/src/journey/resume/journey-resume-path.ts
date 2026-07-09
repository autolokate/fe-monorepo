import { AUTH_COMPLETED } from '@/features/shared-auth/types.js';

import { getPostAuthActivationPath } from '../activation-routing.js';
import { authJourneyPaths } from '../auth/auth-routing.js';
import { journeyPaths } from '../constants.js';
import type { JourneyPhase, PersistedJourneyState } from '../types.js';

const BARE_ENTRY_PATHS = new Set<string>([
  journeyPaths.entry,
  '/journey/auth/mobile',
  '/journey/auth',
  '/journey',
  '/',
]);

/** Paths that must not be used as a resume target (entry / auth bootstrap). */
export function isJourneyResumePath(path: string): boolean {
  const normalized = path.split('?')[0]?.trim() ?? '';
  if (!normalized || BARE_ENTRY_PATHS.has(normalized)) {
    return false;
  }
  return normalized.startsWith('/journey/') || normalized.startsWith('/pwa/scan/');
}

/** Persist only in-journey routes worth restoring after a direct entry URL visit. */
export function shouldTrackJourneyRoute(pathname: string): boolean {
  return isJourneyResumePath(pathname);
}

/** Best route to restore for an authenticated user returning without a QR code. */
export function resolveJourneyResumePath(
  persisted: PersistedJourneyState,
  _phase: JourneyPhase,
  lastRoutePath?: string | null,
): string {
  if (lastRoutePath && isJourneyResumePath(lastRoutePath)) {
    return lastRoutePath;
  }

  const { authStatus, selectedFlow, session } = persisted;

  if (authStatus === AUTH_COMPLETED) {
    return getPostAuthActivationPath(selectedFlow, session);
  }

  if (session.auth?.otpVerified) {
    return authJourneyPaths.vehicleOwner;
  }

  if (session.auth?.mobile) {
    return authJourneyPaths.otp;
  }

  return getPostAuthActivationPath(selectedFlow, session);
}
