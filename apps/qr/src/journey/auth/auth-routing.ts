import { journeyPaths } from '../constants';
import { purchaseJourneyPaths } from '../purchase/purchase-routing';

/** Query flag: land on mobile auth form (skip QR scan) after welcome / in-flow auth. */
export const AUTH_ENTRY_QUERY = {
  param: 'auth',
  continueValue: 'continue',
} as const;

export function isAuthMobileContinueEntry(searchParams: URLSearchParams): boolean {
  return searchParams.get(AUTH_ENTRY_QUERY.param) === AUTH_ENTRY_QUERY.continueValue;
}

export function authMobileUrl(options?: { continueAuth?: boolean }): string {
  if (!options?.continueAuth) {
    return authJourneyPaths.mobile;
  }
  const params = new URLSearchParams({
    [AUTH_ENTRY_QUERY.param]: AUTH_ENTRY_QUERY.continueValue,
  });
  return `${authJourneyPaths.mobile}?${params.toString()}`;
}

export const authJourneyPaths = {
  mobile: journeyPaths.auth,
  otp: journeyPaths.otp,
  vehicleOwner: journeyPaths.profile,
  privacy: journeyPaths.legalPrivacy,
  terms: journeyPaths.legalTerms,
  /** @deprecated Removed from active graph — redirects to auth */
  splash: journeyPaths.auth,
} as const;

/** Active shared auth sequence (QR scan entry assumed before auth). */
export const authStepPathSequence = [
  authJourneyPaths.mobile,
  authJourneyPaths.otp,
  authJourneyPaths.vehicleOwner,
] as const;

/** @deprecated Legacy shared routes — purchase activation screens relocated */
export const legacySharedPaths = {
  r01VehicleNumber: '/shared/r01-vehicle-number',
  r02VehicleDetails: '/shared/r02-vehicle-details',
  r05AccountCreation: '/shared/r05-account-creation',
  r06LegalConsent: '/shared/r06-legal-consent',
} as const;

/** First post-auth activation step when flow is not yet resolved. */
export const defaultActivationAfterAuth = purchaseJourneyPaths.vehicleDetails;
