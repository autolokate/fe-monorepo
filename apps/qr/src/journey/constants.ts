import type { ActivationFlowId } from './types';

export const JOURNEY_STORAGE_KEY = 'al-journey-v1';
export const SELECTED_FLOW_KEY = 'al-selected-flow';

/** Root-level public onboarding paths (no `/journey` prefix). */
export const journeyPaths = {
  /** Production QR entry — `/auth?q=` or `/q/:code` */
  entry: '/auth',
  root: '/auth',
  auth: '/auth',
  /** @deprecated Alias — redirects to `/auth` */
  scan: '/auth',
  otp: '/otp',
  profile: '/profile',
  qrDeepLinkPrefix: '/q',
  legalPrivacy: '/legal/privacy',
  legalTerms: '/legal/terms',
  prepaid: '/prepaid',
  prepaidWildcard: '/prepaid/*',
  b2b2c: '/b2b2c',
  b2b2cWildcard: '/b2b2c/*',
  emergency: '/emergency',
  emergencyWildcard: '/emergency/*',
  completed: '/completed',
} as const;

export function buildQrDeepLinkPath(qrCode: string): string {
  return `${journeyPaths.qrDeepLinkPrefix}/${encodeURIComponent(qrCode.trim())}`;
}

export const flowLabels: Record<ActivationFlowId, string> = {
  purchase: 'Consumer QR Activation + Purchase',
  prepaid: 'Consumer QR Activation — B2B (Pre-Paid)',
  b2b2c: 'Consumer QR Activation — B2B2C',
};
