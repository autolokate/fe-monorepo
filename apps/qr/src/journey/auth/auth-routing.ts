import {
  buildAuthPaths,
  LEGACY_FLAT_PATHS,
  parseJourneyIdFromPathname,
  ROUTE_NAMESPACE,
} from '../routing/journey-url-routing';

export { AUTH_ENTRY_QUERY, isAuthMobileContinueEntry } from './auth-entry-query';

/** Build auth paths for a journey id (QR code). */
export { buildAuthPaths };

function readJourneyIdFromUrl(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

/** Journey-scoped auth paths when `:journeyId` is in the URL; legacy flat paths otherwise. */
export const authJourneyPaths = new Proxy(
  {
    mobile: LEGACY_FLAT_PATHS.auth,
    otp: LEGACY_FLAT_PATHS.otp,
    vehicleOwner: LEGACY_FLAT_PATHS.profile,
    privacy: ROUTE_NAMESPACE.legalPrivacy,
    terms: ROUTE_NAMESPACE.legalTerms,
    splash: LEGACY_FLAT_PATHS.auth,
  },
  {
    get(target, prop: string) {
      const journeyId = parseJourneyIdFromPathname(
        typeof window !== 'undefined' ? window.location.pathname : '',
      );
      if (
        journeyId &&
        (prop === 'mobile' || prop === 'otp' || prop === 'vehicleOwner')
      ) {
        const paths = buildAuthPaths(journeyId);
        if (prop === 'mobile') {
          return paths.mobile;
        }
        if (prop === 'otp') {
          return paths.otp;
        }
        return paths.vehicleOwner;
      }
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      const paths = buildAuthPaths(readJourneyIdFromUrl());
      return paths[prop as keyof typeof paths];
    },
  },
);

export function authMobileUrl(
  journeyIdOrOptions: string | { continueAuth?: boolean },
  options?: { continueAuth?: boolean },
): string {
  if (typeof journeyIdOrOptions === 'object') {
    return authMobileUrl(readJourneyIdFromUrl(), journeyIdOrOptions);
  }
  const paths = buildAuthPaths(journeyIdOrOptions);
  if (!options?.continueAuth) {
    return paths.mobile;
  }
  const params = new URLSearchParams({ auth: 'continue' });
  return `${paths.mobile}?${params.toString()}`;
}

export const authStepPathSequence = (journeyId: string) =>
  [
    buildAuthPaths(journeyId).mobile,
    buildAuthPaths(journeyId).otp,
    buildAuthPaths(journeyId).vehicleOwner,
  ] as const;

/** @deprecated Legacy shared routes — dev preview only */
export const legacySharedPaths = {
  r01VehicleNumber: '/shared/r01-vehicle-number',
  r02VehicleDetails: '/shared/r02-vehicle-details',
  r05AccountCreation: '/shared/r05-account-creation',
  r06LegalConsent: '/shared/r06-legal-consent',
} as const;

export { LEGACY_FLAT_PATHS, ROUTE_NAMESPACE };

/** First post-auth activation step when flow is not yet resolved. */
export function defaultActivationAfterAuth(journeyId: string): string {
  return buildAuthPaths(journeyId).mobile;
}
