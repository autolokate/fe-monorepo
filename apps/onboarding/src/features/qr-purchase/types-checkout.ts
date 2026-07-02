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
};

export type PurchaseRiderOption = {
  riderCount: 1 | 2;
  pricePaise: number;
  originalPricePaise: number;
  discountPercent: number;
};

export type PurchasePlanDefinition = {
  id: PurchasePlanId;
  name: string;
  priceLabel: string;
  priceInr: number;
  pricePaise: number;
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
