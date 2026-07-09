import type { StepDefinition, StepId } from '@/types/flow.js';

import { sharedPipelineStepConfig } from './shared-pipeline.config.js';

/** Flow-specific step definitions — referenced by flow config entries. */
export const flowSpecificStepConfig = {
  'purchase.vehicle-number': {
    id: 'purchase.vehicle-number',
    kind: 'flow-specific',
    screenId: 'VehicleNumber',
    label: 'R03 · Vehicle number',
    guardIds: ['guard.legal-accepted'],
  },
  'purchase.fetching-vehicle': {
    id: 'purchase.fetching-vehicle',
    kind: 'flow-specific',
    screenId: 'VehicleDetails',
    label: 'R04 · Fetching details',
  },
  'purchase.confirm-vehicle': {
    id: 'purchase.confirm-vehicle',
    kind: 'flow-specific',
    screenId: 'VehicleDetails',
    label: 'R05 · Confirm vehicle',
    guardIds: ['guard.vehicle-confirmed'],
  },
  'purchase.choose-plan': {
    id: 'purchase.choose-plan',
    kind: 'flow-specific',
    screenId: 'PlanSelection',
    label: 'R06 · Choose plan',
  },
  'purchase.rider-cover': {
    id: 'purchase.rider-cover',
    kind: 'flow-specific',
    screenId: 'RiderSelection',
    label: 'R07 · Rider cover',
  },
  'purchase.order-summary': {
    id: 'purchase.order-summary',
    kind: 'flow-specific',
    screenId: 'CheckoutSummary',
    label: 'R08 · Order summary',
  },
  'purchase.processing-payment': {
    id: 'purchase.processing-payment',
    kind: 'flow-specific',
    screenId: 'PaymentProcessing',
    label: 'R09 · Processing payment',
  },
  'purchase.payment-success': {
    id: 'purchase.payment-success',
    kind: 'flow-specific',
    screenId: 'PaymentSuccess',
    label: 'R10 · Payment success',
  },
  /** @deprecated Pre-auth QR / legacy P01–P06 — retained for orphan routes & catalog */
  'purchase.qr-scan': {
    id: 'purchase.qr-scan',
    kind: 'flow-specific',
    screenId: 'QrScan',
    label: 'QR scan',
    guardIds: ['guard.qr-valid'],
  },
  'purchase.plan-select': {
    id: 'purchase.plan-select',
    kind: 'flow-specific',
    screenId: 'PlanSelection',
    label: 'P01 · Plan selection (deprecated)',
    guardIds: ['guard.legal-accepted'],
  },
  'purchase.plan-details': {
    id: 'purchase.plan-details',
    kind: 'flow-specific',
    screenId: 'PlanDetails',
    label: 'P02 · Plan details (deprecated)',
  },
  'purchase.rider-select': {
    id: 'purchase.rider-select',
    kind: 'flow-specific',
    screenId: 'RiderSelection',
    label: 'P03 · Rider selection (deprecated)',
  },
  'purchase.checkout-summary': {
    id: 'purchase.checkout-summary',
    kind: 'flow-specific',
    screenId: 'CheckoutSummary',
    label: 'P04 · Checkout summary (deprecated)',
  },
  'purchase.payment-processing': {
    id: 'purchase.payment-processing',
    kind: 'flow-specific',
    screenId: 'PaymentProcessing',
    label: 'P05 · Payment processing (deprecated)',
  },
  'b2b.org-verify': {
    id: 'b2b.org-verify',
    kind: 'flow-specific',
    screenId: 'OrgVerify',
    label: 'Org verify',
    guardIds: ['guard.org-verified'],
  },
  'b2b.fleet-assign': {
    id: 'b2b.fleet-assign',
    kind: 'flow-specific',
    screenId: 'FleetAssign',
    label: 'Fleet assign',
  },
  'b2b.confirmation': {
    id: 'b2b.confirmation',
    kind: 'flow-specific',
    screenId: 'B2bConfirmation',
    label: 'B2B confirmation',
  },
  'prepaid.entry': {
    id: 'prepaid.entry',
    kind: 'flow-specific',
    screenId: 'PrepaidEntry',
    label: 'PR01 · Pre-paid entry',
    guardIds: ['guard.qr-valid'],
  },
  'prepaid.activation-code': {
    id: 'prepaid.activation-code',
    kind: 'flow-specific',
    screenId: 'ActivationCode',
    label: 'PR02 · Activation code',
  },
  'prepaid.code-validation': {
    id: 'prepaid.code-validation',
    kind: 'flow-specific',
    screenId: 'CodeValidation',
    label: 'PR03 · Code validation',
    guardIds: ['guard.voucher-valid'],
  },
  'b2b2c.partner-bridge': {
    id: 'b2b2c.partner-bridge',
    kind: 'flow-specific',
    screenId: 'PartnerBridge',
    label: 'Partner bridge',
    guardIds: ['guard.partner-session'],
  },
  'b2b2c.offer-select': {
    id: 'b2b2c.offer-select',
    kind: 'flow-specific',
    screenId: 'OfferSelect',
    label: 'Offer select',
  },
  'b2b2c.confirmation': {
    id: 'b2b2c.confirmation',
    kind: 'flow-specific',
    screenId: 'B2b2cConfirmation',
    label: 'B2B2C confirmation',
  },
  'emergency.rider-prompt': {
    id: 'emergency.rider-prompt',
    kind: 'flow-specific',
    screenId: 'EmergencyRiderPrompt',
    label: 'Rider prompt',
  },
  'emergency.rider-mobile': {
    id: 'emergency.rider-mobile',
    kind: 'flow-specific',
    screenId: 'EmergencyRiderMobile',
    label: 'Rider mobile',
  },
  'emergency.rider-otp': {
    id: 'emergency.rider-otp',
    kind: 'flow-specific',
    screenId: 'EmergencyRiderOtp',
    label: 'Rider OTP',
  },
  'emergency.rider-name': {
    id: 'emergency.rider-name',
    kind: 'flow-specific',
    screenId: 'EmergencyRiderName',
    label: 'Rider name',
  },
  'emergency.riders-summary': {
    id: 'emergency.riders-summary',
    kind: 'flow-specific',
    screenId: 'EmergencyRidersSummary',
    label: 'Riders summary',
  },
  'emergency.contacts-empty': {
    id: 'emergency.contacts-empty',
    kind: 'flow-specific',
    screenId: 'EmergencyContactsEmpty',
    label: 'Emergency contacts empty',
  },
  'emergency.contact-mobile': {
    id: 'emergency.contact-mobile',
    kind: 'flow-specific',
    screenId: 'EmergencyContactMobile',
    label: 'Contact mobile',
  },
  'emergency.contact-otp': {
    id: 'emergency.contact-otp',
    kind: 'flow-specific',
    screenId: 'EmergencyContactOtp',
    label: 'Contact OTP',
  },
  'emergency.contact-name': {
    id: 'emergency.contact-name',
    kind: 'flow-specific',
    screenId: 'EmergencyContactName',
    label: 'Contact name',
  },
  'emergency.contacts-summary': {
    id: 'emergency.contacts-summary',
    kind: 'flow-specific',
    screenId: 'EmergencyContactsSummary',
    label: 'Emergency contacts summary',
  },
} as const satisfies Record<string, StepDefinition>;

export const stepsConfig: Record<StepId, StepDefinition> = {
  ...sharedPipelineStepConfig,
  ...flowSpecificStepConfig,
};
