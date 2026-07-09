import type { ActivationFlowId } from './types';

export const JOURNEY_STORAGE_KEY = 'al-journey-v1';
export const SELECTED_FLOW_KEY = 'al-selected-flow';

export const journeyPaths = {
  /** Production QR entry — scan lands on auth mobile with ?qr_code= */
  entry: '/journey/auth/mobile',
  root: '/journey/auth/mobile',
  auth: '/journey/auth',
  authWildcard: '/journey/auth/*',
  purchase: '/journey/purchase',
  purchaseWildcard: '/journey/purchase/*',
  prepaid: '/journey/prepaid',
  prepaidWildcard: '/journey/prepaid/*',
  b2b2c: '/journey/b2b2c',
  b2b2cWildcard: '/journey/b2b2c/*',
  emergency: '/journey/emergency',
  emergencyWildcard: '/journey/emergency/*',
  completed: '/journey/completed',
} as const;

export const flowLabels: Record<ActivationFlowId, string> = {
  purchase: 'Consumer QR Activation + Purchase',
  prepaid: 'Consumer QR Activation — B2B (Pre-Paid)',
  b2b2c: 'Consumer QR Activation — B2B2C',
};
