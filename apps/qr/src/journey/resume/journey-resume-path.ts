import { AUTH_COMPLETED } from '@/features/shared-auth/types';

import { getPostAuthActivationPath } from '../activation-routing';
import { authJourneyPaths } from '../auth/auth-routing';
import { journeyPaths } from '../constants';
import { isPurchaseRoutePath } from '../purchase/purchase-routing';
import type { JourneyPhase, PersistedJourneyState } from '../types';

const BARE_ENTRY_PATHS = new Set<string>([
  journeyPaths.entry,
  journeyPaths.auth,
  journeyPaths.root,
  journeyPaths.qrDeepLinkPrefix,
  '/',
  '/scan',
  // Legacy entry URLs (redirect only — not resume targets)
  '/journey/auth/mobile',
  '/journey/auth',
  '/journey',
]);

/** Paths that must not be used as a resume target (entry / auth bootstrap). */
export function isJourneyResumePath(path: string): boolean {
  const normalized = path.split('?')[0]?.trim() ?? '';
  if (!normalized || BARE_ENTRY_PATHS.has(normalized)) {
    return false;
  }
  if (normalized.startsWith(`${journeyPaths.qrDeepLinkPrefix}/`)) {
    return false;
  }
  return (
    normalized.startsWith('/journey/') ||
    normalized.startsWith('/pwa/scan/') ||
    normalized.startsWith('/emergency/') ||
    normalized.startsWith('/prepaid/') ||
    normalized.startsWith('/b2b2c/') ||
    normalized === journeyPaths.otp ||
    normalized === journeyPaths.profile ||
    isPurchaseRoutePath(normalized)
  );
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
