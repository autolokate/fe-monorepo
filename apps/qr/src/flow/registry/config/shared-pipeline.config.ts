import type { SharedStepId, StepDefinition } from '@/types/flow.js';

/** Active shared auth pipeline — QR entry assumed before onboarding. */
export const SHARED_PIPELINE_STEP_IDS = [
  'shared.mobile',
  'shared.otp',
  'shared.account',
] as const satisfies readonly SharedStepId[];

export type SharedPipelineStepId = (typeof SHARED_PIPELINE_STEP_IDS)[number];

export type SharedStepCatalog = typeof sharedPipelineStepConfig;

export const sharedPipelineStepConfig: Record<SharedStepId, StepDefinition> = {
  'shared.splash': {
    id: 'shared.splash',
    kind: 'shared',
    screenId: 'Splash',
    label: 'S0 · Splash',
  },
  'shared.mobile': {
    id: 'shared.mobile',
    kind: 'shared',
    screenId: 'MobileCapture',
    label: 'A1 · Mobile',
  },
  'shared.otp': {
    id: 'shared.otp',
    kind: 'shared',
    screenId: 'OtpVerify',
    label: 'A2 · OTP',
    guardIds: ['guard.otp-verified'],
  },
  'shared.vehicle-number': {
    id: 'shared.vehicle-number',
    kind: 'shared',
    screenId: 'VehicleNumber',
    label: 'R01 · Vehicle number (deprecated)',
    guardIds: ['guard.qr-valid'],
  },
  'shared.vehicle-details': {
    id: 'shared.vehicle-details',
    kind: 'shared',
    screenId: 'VehicleDetails',
    label: 'R02 · Vehicle details (deprecated)',
    guardIds: ['guard.vehicle-confirmed'],
  },
  'shared.account': {
    id: 'shared.account',
    kind: 'shared',
    screenId: 'AccountSetup',
    label: 'A3 · Vehicle owner',
    guardIds: ['guard.authenticated'],
  },
  'shared.legal': {
    id: 'shared.legal',
    kind: 'shared',
    screenId: 'LegalConsent',
    label: 'R06 · Legal consent (deprecated)',
    guardIds: ['guard.authenticated'],
  },
};
