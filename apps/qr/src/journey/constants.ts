import type { ActivationFlowId } from './types';
import {
  ROUTE_NAMESPACE,
  buildQrEntryPath,
  LEGACY_FLAT_PATHS,
} from './routing/journey-url-routing';

export const JOURNEY_STORAGE_KEY = 'al-journey-v1';

/** Root-level public onboarding paths. */
export const journeyPaths = {
  /** Universal QR entry */
  entry: ROUTE_NAMESPACE.q,
  root: ROUTE_NAMESPACE.q,
  qrDeepLinkPrefix: ROUTE_NAMESPACE.q,
  onboardingPrefix: ROUTE_NAMESPACE.onboarding,
  emergencyPrefix: ROUTE_NAMESPACE.emergency,
  scanPrefix: ROUTE_NAMESPACE.scan,
  legalPrivacy: ROUTE_NAMESPACE.legalPrivacy,
  legalTerms: ROUTE_NAMESPACE.legalTerms,
  prepaid: ROUTE_NAMESPACE.prepaid,
  prepaidWildcard: `${ROUTE_NAMESPACE.prepaid}/*`,
  b2b2c: ROUTE_NAMESPACE.b2b2c,
  b2b2cWildcard: `${ROUTE_NAMESPACE.b2b2c}/*`,
  emergency: ROUTE_NAMESPACE.emergency,
  emergencyWildcard: `${ROUTE_NAMESPACE.emergency}/*`,
  completed: ROUTE_NAMESPACE.completed,
  /** Legacy flat paths — redirect only */
  auth: LEGACY_FLAT_PATHS.auth,
  otp: LEGACY_FLAT_PATHS.otp,
  profile: LEGACY_FLAT_PATHS.profile,
  scan: LEGACY_FLAT_PATHS.scan,
} as const;

export function buildQrDeepLinkPath(qrCode: string): string {
  return buildQrEntryPath(qrCode);
}

export const flowLabels: Record<ActivationFlowId, string> = {
  purchase: 'Consumer QR Activation + Purchase',
  prepaid: 'Consumer QR Activation — B2B (Pre-Paid)',
  b2b2c: 'Consumer QR Activation — B2B2C',
};
