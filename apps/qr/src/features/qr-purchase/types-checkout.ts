import type { LandingEntitlement } from '../b2b-shared/types-landing';

/** Figma R06 plan tiers — Safe · Secure · Shield · Shield+ */
export type PurchasePlanId = 'safe' | 'secure' | 'shield' | 'shield-plus';

export type PurchaseRiderCount = 0 | 1 | 2;

export type PurchasePaymentStatus =
  | 'idle'
  | 'processing'
  | 'confirming'
  | 'success'
  | 'failed'
  | 'unconfirmed';

export type PurchaseCheckoutSession = {
  selectedPlanId?: PurchasePlanId;
  riderCount?: PurchaseRiderCount;
  promoCode?: string | null;
  promoApplied?: boolean;
  promoInvalid?: boolean;
  /** Set when user taps Pay on R08/R08b. */
  checkoutReady?: boolean;
  paymentStatus?: PurchasePaymentStatus;
  paidAmountInr?: number;
  /** Preview entitlement from GET /v1/activation/preview (B2C welcome). */
  entitlement?: LandingEntitlement;
  /** True after Skip on R06 — proceeds to vehicle lookup with funded plan. */
  skippedPlanUpgrade?: boolean;
  /**
   * True after Upgrade on R06 — vehicle → riders → order → pay → attach.
   * Mutual exclusive with `skippedPlanUpgrade` for a normal activation.
   */
  upgradeCheckout?: boolean;
};

export type PurchaseRiderOption = {
  riderCount: 1 | 2;
  pricePaise: number;
  originalPricePaise: number;
  discountPercent: number;
};

export type PurchasePlanDefinition = {
  id: PurchasePlanId;
  /** Backend plan-version id for POST /v1/cart. */
  planVersionId: string;
  name: string;
  priceLabel: string;
  priceInr: number;
  pricePaise: number;
  /**
   * Amount due for this row (activation/plans).
   * `0` on the funded/included plan; upgrade delta on options.
   */
  payablePaise?: number;
  /** True when this row is the already-funded plan from GET /v1/activation/plans. */
  included?: boolean;
  badge?: string | null;
  includesLabel?: string | null;
  features: readonly string[];
  riderEligible: boolean;
  riderOptions: readonly PurchaseRiderOption[];
  addon?: { label: string };
  /** Figma Secure card is 366px vs 340px for others. */
  tall?: boolean;
};

export type OrderSummaryLine = {
  label: string;
  value: string;
  tone?: 'default' | 'promo';
};

export type OrderSummaryTotals = {
  planLine: OrderSummaryLine;
  riderLine?: OrderSummaryLine;
  promoLine?: OrderSummaryLine;
  totalLabel: string;
  totalInr: number;
  gstNote: string;
  payCtaLabel: string;
};
