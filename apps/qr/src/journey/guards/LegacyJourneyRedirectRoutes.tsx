import { Navigate, useParams } from 'react-router-dom';

import { journeyPaths } from '../constants';
import { QR_URL_PARAMS } from '@/platform/qr/qr-url-params';
import { authJourneyPaths } from '../auth/auth-routing';
import {
  legacyJourneyPurchasePathRedirects,
  legacyPurchasePathRedirects,
  purchaseJourneyPaths,
} from '../purchase/purchase-routing';

/** `/q/:qrCode` → `/auth?q=:qrCode` */
export function QrDeepLinkRoute() {
  const { qrCode = '' } = useParams<{ qrCode: string }>();
  const trimmed = qrCode.trim();
  if (!trimmed) {
    return <Navigate to={journeyPaths.auth} replace />;
  }
  const search = new URLSearchParams({ [QR_URL_PARAMS.qrCode]: trimmed }).toString();
  return <Navigate to={{ pathname: journeyPaths.auth, search }} replace />;
}

export const LEGACY_JOURNEY_AUTH_REDIRECTS = [
  ['/journey/auth/mobile', authJourneyPaths.mobile],
  ['/journey/auth/otp', authJourneyPaths.otp],
  ['/journey/auth/vehicle-owner', authJourneyPaths.vehicleOwner],
  ['/journey/auth/legal/privacy', authJourneyPaths.privacy],
  ['/journey/auth/legal/terms', authJourneyPaths.terms],
  ['/journey/auth/splash', authJourneyPaths.mobile],
  ['/journey/auth', authJourneyPaths.mobile],
] as const;

export const LEGACY_JOURNEY_ENTRY_REDIRECTS = [
  ['/journey', journeyPaths.auth],
  ['/journey/home', journeyPaths.auth],
  ['/journey/flow-hub', journeyPaths.auth],
  ['/journey/qr-scan', journeyPaths.auth],
  ['/journey/purchase/qr-scan', purchaseJourneyPaths.vehicleDetails],
  ['/journey/purchase', purchaseJourneyPaths.vehicleDetails],
  ['/journey/completed', journeyPaths.completed],
] as const;

export const LEGACY_JOURNEY_PURCHASE_REDIRECTS = [
  ...legacyJourneyPurchasePathRedirects.map(
    ([segment, to]) => [`/journey/purchase/${segment}`, to] as const,
  ),
  ...legacyPurchasePathRedirects.map(
    ([segment, to]) => [`/journey/purchase/${segment}`, to] as const,
  ),
];
