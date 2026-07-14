import { AUTH_COMPLETED } from '@/features/shared-auth/types';

import { getPostAuthActivationPath } from '../activation-routing';
import { buildAuthPaths } from '../auth/auth-routing';
import { journeyPaths } from '../constants';
import { isPurchaseRoutePath } from '../purchase/purchase-routing';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { parseJourneyIdFromPathname, ROUTE_NAMESPACE } from '../routing/journey-url-routing';
import type { JourneyPhase, PersistedJourneyState } from '../types';

const BARE_ENTRY_PATHS = new Set<string>([
  journeyPaths.entry,
  journeyPaths.root,
  journeyPaths.qrDeepLinkPrefix,
  '/',
  '/scan',
  '/auth',
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
    normalized.startsWith(`${ROUTE_NAMESPACE.scan}/`) ||
    normalized.startsWith(`${ROUTE_NAMESPACE.onboarding}/`) ||
    normalized.startsWith(`${ROUTE_NAMESPACE.emergency}/`) ||
    normalized.startsWith(`${ROUTE_NAMESPACE.prepaid}/`) ||
    normalized.startsWith(`${ROUTE_NAMESPACE.b2b2c}/`) ||
    normalized === '/otp' ||
    normalized === '/profile' ||
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
  journeyId?: string | null,
): string {
  const resolvedJourneyId =
    journeyId?.trim() ||
    (lastRoutePath ? parseJourneyIdFromPathname(lastRoutePath) : null) ||
    resolvePurchaseQrCode();

  if (lastRoutePath && isJourneyResumePath(lastRoutePath)) {
    return lastRoutePath;
  }

  const { authStatus, selectedFlow, session } = persisted;

  if (resolvedJourneyId) {
    const auth = buildAuthPaths(resolvedJourneyId);

    if (authStatus === AUTH_COMPLETED) {
      return getPostAuthActivationPath(selectedFlow, resolvedJourneyId, session);
    }

    if (session.auth?.otpVerified) {
      if (session.auth.isNewUser) {
        return auth.vehicleOwner;
      }
      return getPostAuthActivationPath(selectedFlow, resolvedJourneyId, session);
    }

    if (session.auth?.mobile) {
      return auth.otp;
    }

    return getPostAuthActivationPath(selectedFlow, resolvedJourneyId, session);
  }

  return journeyPaths.entry;
}
