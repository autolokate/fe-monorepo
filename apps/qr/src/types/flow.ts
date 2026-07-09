/**
 * Canonical product areas in the qr application.
 * Maps to Figma file sections under Autolokate · Consumer App (node 5:2).
 */
export type ProductAreaId =
  | 'qr-purchase'
  | 'qr-b2b'
  | 'qr-prepaid'
  | 'qr-b2b2c'
  | 'emergency'
  | 'shared-auth'
  | 'shared-legal';

export type FlowId =
  | 'purchase'
  | 'b2b'
  | 'prepaid'
  | 'b2b2c'
  | 'emergency';

export type SharedFlowId = 'shared' | 'auth' | 'legal';

export type AnyFlowId = FlowId | SharedFlowId;

/**
 * Shared onboarding pipeline — defined once in config, referenced by all QR flows.
 * R01 → R06
 */
export type SharedStepId =
  | 'shared.splash'
  | 'shared.mobile'
  | 'shared.otp'
  | 'shared.vehicle-number'
  | 'shared.vehicle-details'
  | 'shared.account'
  | 'shared.legal';

export type PurchaseStepId =
  | 'purchase.vehicle-number'
  | 'purchase.fetching-vehicle'
  | 'purchase.confirm-vehicle'
  | 'purchase.choose-plan'
  | 'purchase.rider-cover'
  | 'purchase.order-summary'
  | 'purchase.processing-payment'
  | 'purchase.payment-success'
  /** @deprecated Legacy P01–P06 / pre-auth QR scan — not in active journey */
  | 'purchase.qr-scan'
  | 'purchase.plan-select'
  | 'purchase.plan-details'
  | 'purchase.rider-select'
  | 'purchase.checkout-summary'
  | 'purchase.payment-processing';

export type B2bStepId =
  | 'b2b.org-verify'
  | 'b2b.fleet-assign'
  | 'b2b.confirmation';

export type PrepaidStepId =
  | 'prepaid.entry'
  | 'prepaid.activation-code'
  | 'prepaid.code-validation';

export type B2b2cStepId =
  | 'b2b2c.partner-bridge'
  | 'b2b2c.offer-select'
  | 'b2b2c.confirmation';

export type EmergencyStepId =
  | 'emergency.rider-prompt'
  | 'emergency.rider-mobile'
  | 'emergency.rider-otp'
  | 'emergency.rider-name'
  | 'emergency.riders-summary'
  | 'emergency.contacts-empty'
  | 'emergency.contact-mobile'
  | 'emergency.contact-otp'
  | 'emergency.contact-name'
  | 'emergency.contacts-summary';

export type FlowSpecificStepId =
  | PurchaseStepId
  | B2bStepId
  | PrepaidStepId
  | B2b2cStepId
  | EmergencyStepId;

export type StepId = SharedStepId | FlowSpecificStepId;

export type StepKind = 'shared' | 'flow-specific';

/** Screen identifiers — mapped to feature folders (features/…/screens/). */
export type ScreenId =
  // Shared Auth (Figma 91:268)
  | 'Splash'
  | 'MobileCapture'
  | 'OtpVerify'
  | 'PrivacyPolicy'
  | 'TermsConditions'
  // Purchase activation (relocated from Shared Auth)
  | 'VehicleNumber'
  | 'VehicleDetails'
  | 'AccountSetup'
  | 'LegalConsent'
  // Purchase (Phase 5)
  | 'PlanSelection'
  | 'PlanDetails'
  | 'RiderSelection'
  | 'CheckoutSummary'
  | 'PaymentProcessing'
  | 'PaymentSuccess'
  | 'QrScan'
  // B2B
  | 'OrgVerify'
  | 'FleetAssign'
  | 'B2bConfirmation'
  // Pre-paid (Phase 7)
  | 'PrepaidEntry'
  | 'ActivationCode'
  | 'CodeValidation'
  // B2B2C
  | 'PartnerBridge'
  | 'OfferSelect'
  | 'B2b2cConfirmation'
  // Emergency (Phase 11b)
  | 'EmergencyRiderPrompt'
  | 'EmergencyRiderMobile'
  | 'EmergencyRiderOtp'
  | 'EmergencyRiderName'
  | 'EmergencyRidersSummary'
  | 'EmergencyContactsEmpty'
  | 'EmergencyContactMobile'
  | 'EmergencyContactOtp'
  | 'EmergencyContactName'
  | 'EmergencyContactsSummary';

export type StepDefinition = {
  id: StepId;
  kind: StepKind;
  screenId: ScreenId;
  guardIds?: readonly GuardId[];
  label: string;
};

export type FlowDefinition = {
  id: AnyFlowId;
  productArea: ProductAreaId;
  label: string;
  steps: readonly StepId[];
  entryGuardIds?: readonly GuardId[];
};

export type GuardId =
  | 'guard.authenticated'
  | 'guard.otp-verified'
  | 'guard.vehicle-confirmed'
  | 'guard.legal-accepted'
  | 'guard.qr-valid'
  | 'guard.org-verified'
  | 'guard.voucher-valid'
  | 'guard.partner-session';

export type GuardResult = 'allow' | 'redirect' | 'block';

export type FlowGuardDefinition = {
  id: GuardId;
  label: string;
  redirectStepId?: StepId;
};

export type FlowContext = {
  flowId: AnyFlowId;
  currentStepId: StepId;
  completedStepIds: readonly StepId[];
  session: Record<string, unknown>;
};

export type FlowTransition = {
  from: StepId;
  to: StepId;
  trigger: 'next' | 'back' | 'skip' | 'guard-redirect' | 'error';
};

export type ScreenInventoryEntry = {
  id: ScreenId;
  stepId: SharedStepId | StepId;
  featureFolder: string;
  figmaRef: string;
  description: string;
};

/** Presentational screen view states — no business logic. */
export type ScreenViewState = 'default' | 'loading' | 'error' | 'empty' | 'success';

export const SHARED_FLOW_STEP_COUNT = 5;
