import type { FlowGuardDefinition, GuardId } from '../../types/flow.js';

/** Guard catalog — pure definitions, no runtime evaluation yet */
export const guardCatalog: Record<GuardId, FlowGuardDefinition> = {
  'guard.authenticated': {
    id: 'guard.authenticated',
    label: 'User session is authenticated',
    redirectStepId: 'shared.mobile',
  },
  'guard.otp-verified': {
    id: 'guard.otp-verified',
    label: 'Mobile OTP verified',
    redirectStepId: 'shared.otp',
  },
  'guard.vehicle-confirmed': {
    id: 'guard.vehicle-confirmed',
    label: 'Vehicle RC confirmed',
    redirectStepId: 'shared.vehicle-number',
  },
  'guard.legal-accepted': {
    id: 'guard.legal-accepted',
    label: 'Terms and privacy accepted',
    redirectStepId: 'shared.mobile',
  },
  'guard.qr-valid': {
    id: 'guard.qr-valid',
    label: 'QR activation token is valid',
  },
  'guard.org-verified': {
    id: 'guard.org-verified',
    label: 'B2B organization verified',
    redirectStepId: 'b2b.org-verify',
  },
  'guard.voucher-valid': {
    id: 'guard.voucher-valid',
    label: 'Pre-paid voucher is valid',
    redirectStepId: 'prepaid.entry',
  },
  'guard.partner-session': {
    id: 'guard.partner-session',
    label: 'B2B2C partner session established',
    redirectStepId: 'b2b2c.partner-bridge',
  },
};

export type GuardCatalog = typeof guardCatalog;
