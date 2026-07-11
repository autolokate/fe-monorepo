import { Navigate, useLocation, useParams } from 'react-router-dom';

import { QR_URL_PARAMS } from '@/platform/qr/qr-url-params';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';

import { journeyPaths } from '../constants';
import { QrDeepLinkBootstrap } from './QrDeepLinkBootstrap';
import {
  legacyJourneyPurchasePathRedirects,
  legacyPurchasePathRedirects,
  PURCHASE_ROUTE_SEGMENTS,
} from '../purchase/purchase-routing';
import {
  scopedEmergencyPath,
  scopedOnboardingPath,
} from '../routing/journey-url-routing';

/** `/q/:qrCode` — resolve first; activated QRs go straight to scan, purchase QRs to auth. */
export function QrEntryRoute() {
  const { qrCode = '' } = useParams<{ qrCode: string }>();
  const trimmed = decodeURIComponent(qrCode).trim();
  if (!trimmed) {
    return <Navigate to="/" replace />;
  }
  return <QrDeepLinkBootstrap qrCode={trimmed} />;
}

/** @deprecated alias */
export function QrDeepLinkRoute() {
  return <QrEntryRoute />;
}

function useLegacyJourneyId(): string | null {
  const location = useLocation();
  return resolvePurchaseQrCode(new URLSearchParams(location.search));
}

/** Redirect legacy flat paths to journey-scoped equivalents. */
export function LegacyFlatToScopedRedirect({ suffix }: { suffix: string }) {
  const location = useLocation();
  const journeyId = useLegacyJourneyId();

  if (!journeyId) {
    return <Navigate to="/" replace />;
  }

  const searchParams = new URLSearchParams(location.search);
  if (!searchParams.get(QR_URL_PARAMS.qrCode)) {
    searchParams.set(QR_URL_PARAMS.qrCode, journeyId);
  }

  const target = scopedOnboardingPath(journeyId, suffix);
  return <Navigate to={{ pathname: target, search: searchParams.toString() }} replace />;
}

export function LegacyEmergencyFlatRedirect({ suffix }: { suffix: string }) {
  const location = useLocation();
  const journeyId = useLegacyJourneyId();

  if (!journeyId) {
    return <Navigate to="/" replace />;
  }

  const target = scopedEmergencyPath(journeyId, suffix || '/rider-prompt');
  return <Navigate to={{ pathname: target, search: location.search }} replace />;
}

export const LEGACY_JOURNEY_AUTH_REDIRECTS = [
  ['/journey/auth/mobile', '/auth'],
  ['/journey/auth/otp', '/otp'],
  ['/journey/auth/vehicle-owner', '/profile'],
  ['/journey/auth/legal/privacy', journeyPaths.legalPrivacy],
  ['/journey/auth/legal/terms', journeyPaths.legalTerms],
  ['/journey/auth/splash', '/auth'],
  ['/journey/auth', '/auth'],
] as const;

export const LEGACY_JOURNEY_ENTRY_REDIRECTS = [
  ['/journey', '/auth'],
  ['/journey/home', '/auth'],
  ['/journey/flow-hub', '/auth'],
  ['/journey/qr-scan', '/auth'],
  ['/journey/purchase/qr-scan', '/vehicle'],
  ['/journey/purchase', '/vehicle'],
  ['/journey/completed', journeyPaths.completed],
] as const;

export function buildLegacyJourneyPurchaseRedirects(journeyId: string) {
  return [
    ...legacyJourneyPurchasePathRedirects(journeyId).map(
      ([segment, to]) => [`/journey/purchase/${segment}`, to] as const,
    ),
    ...legacyPurchasePathRedirects(journeyId).map(
      ([segment, to]) => [`/journey/purchase/${segment}`, to] as const,
    ),
  ];
}

export const LEGACY_FLAT_PURCHASE_REDIRECTS = Object.values(PURCHASE_ROUTE_SEGMENTS).map(
  (segment) => [segment, segment] as const,
);
