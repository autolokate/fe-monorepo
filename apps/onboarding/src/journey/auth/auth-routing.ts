import { journeyPaths } from '../constants.js';
import { purchaseJourneyPaths } from '../purchase/purchase-routing.js';

export const authJourneyPaths = {
  mobile: `${journeyPaths.auth}/mobile`,
  otp: `${journeyPaths.auth}/otp`,
  vehicleOwner: `${journeyPaths.auth}/vehicle-owner`,
  privacy: `${journeyPaths.auth}/legal/privacy`,
  terms: `${journeyPaths.auth}/legal/terms`,
  /** @deprecated Removed from active graph — redirects to mobile */
  splash: `${journeyPaths.auth}/splash`,
} as const;

/** Active shared auth sequence (QR entry assumed before onboarding). */
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
