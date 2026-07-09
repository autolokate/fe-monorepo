export const PURCHASE_FLOW_STEP_COUNT = 6;

/** Purchase-phase view states (Phase 5). */
export type PurchaseScreenState = 'default' | 'loading' | 'error' | 'success';

export type PurchaseScreenNavigationProps = {
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export type PurchaseStepId =
  | 'purchase.vehicle-number'
  | 'purchase.fetching-vehicle'
  | 'purchase.confirm-vehicle'
  | 'purchase.choose-plan'
  | 'purchase.rider-cover'
  | 'purchase.order-summary'
  | 'purchase.processing-payment'
  | 'purchase.payment-success'
  /** @deprecated Legacy P01–P06 */
  | 'purchase.qr-scan'
  | 'purchase.plan-select'
  | 'purchase.plan-details'
  | 'purchase.rider-select'
  | 'purchase.checkout-summary'
  | 'purchase.payment-processing';

export type PurchaseScreenId =
  | 'PlanSelection'
  | 'PlanDetails'
  | 'RiderSelection'
  | 'CheckoutSummary'
  | 'PaymentProcessing'
  | 'PaymentSuccess';

export type PurchaseScreenInventoryEntry = {
  id: PurchaseScreenId;
  stepId: PurchaseStepId;
  featureFolder: string;
  figmaRef: string;
  description: string;
};
