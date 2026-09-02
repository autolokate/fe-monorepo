import { AUTH_COMPLETED } from '@/features/shared-auth/types';

import { getPostAuthActivationPath } from '../activation-routing';
import { buildAuthPaths } from '../auth/auth-routing';
import { journeyPaths } from '../constants';
import { isPurchaseRoutePath } from '../purchase/purchase-routing';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import { parseJourneyIdFromPathname, ROUTE_NAMESPACE } from '../routing/journey-url-routing';
import type { ActivationFlowId, JourneyPhase, JourneySession, PersistedJourneyState } from '../types';

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

/** Mobile + OTP + `/q` — profile is post-OTP for new users. */
export function isPreLoginAuthPath(pathname: string): boolean {
  const normalized = pathname.split('?')[0]?.replace(/\/+$/, '') ?? '';
  return (
    normalized === '/auth' ||
    normalized === '/otp' ||
    normalized === '/q' ||
    normalized.startsWith('/q/') ||
    normalized.endsWith('/auth') ||
    normalized.endsWith('/otp')
  );
}

/** Paths that must not be used as a resume target (entry / auth bootstrap). */
export function isJourneyResumePath(path: string): boolean {
  const normalized = path.split('?')[0]?.trim() ?? '';
  if (!normalized || BARE_ENTRY_PATHS.has(normalized)) {
    return false;
  }
  if (normalized.startsWith(`${journeyPaths.qrDeepLinkPrefix}/`)) {
    return false;
  }
  if (isPreLoginAuthPath(normalized)) {
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
    normalized === '/profile' ||
    normalized.endsWith('/profile') ||
    isPurchaseRoutePath(normalized)
  );
}

/** Persist only in-journey routes worth restoring after a direct entry URL visit. */
export function shouldTrackJourneyRoute(pathname: string): boolean {
  if (isPreLoginAuthPath(pathname)) {
    return false;
  }
  return isJourneyResumePath(pathname);
}

/**
 * Where a signed-in user returns when they hit /q, /auth, or /otp.
 * Prefer the last post-login screen — never re-run pre-login entry.
 */
export function resolveSignedInBouncePath(options: {
  lastRoutePath?: string | null;
  selectedFlow?: ActivationFlowId | null;
  session?: JourneySession;
  journeyId?: string | null;
}): string {
  const { lastRoutePath, selectedFlow = null, session = {}, journeyId } = options;

  if (lastRoutePath && isJourneyResumePath(lastRoutePath)) {
    return lastRoutePath;
  }

  const resolvedJourneyId =
    journeyId?.trim() ||
    (lastRoutePath ? parseJourneyIdFromPathname(lastRoutePath) : null) ||
    resolvePurchaseQrCode();

  if (resolvedJourneyId) {
    if (session.auth?.isNewUser === true && !session.auth.ownerName) {
      return buildAuthPaths(resolvedJourneyId).vehicleOwner;
    }
    return getPostAuthActivationPath(selectedFlow ?? 'purchase', resolvedJourneyId, session);
  }

  return journeyPaths.entry;
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

  const signedIn = hasAuthTokens();

  if (signedIn) {
    return resolveSignedInBouncePath({
      lastRoutePath,
      selectedFlow: persisted.selectedFlow,
      session: persisted.session,
      journeyId: resolvedJourneyId,
    });
  }

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
