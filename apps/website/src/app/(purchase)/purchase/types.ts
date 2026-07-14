import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type PurchasePlanId = "secure" | "shield" | "shield-plus";

/** The ordered screens the buyer moves through after picking a plan. */
export type PurchaseStep =
  | "plans"
  | "configure"
  | "login"
  | "address"
  | "summary"
  | "success"
  | "tracking"
  // Post-delivery, scan-to-activate (PWA) sub-flow.
  | "scan"
  | "plate"
  | "contacts"
  | "active";

export interface PurchasePlan {
  id: PurchasePlanId;
  name: string;
  /** Short positioning line under the plan name. */
  tag: string;
  /** Annual price in INR (numeric so we can run pricing math). */
  price: number;
  Icon: ComponentType<LucideProps>;
  popular?: boolean;
  popularBadge?: string;
  features: string[];
}

export type PayMethod = "upi" | "card" | "netbanking";

/** All buyer-entered state for the flow — kept in one place so steps stay dumb. */
export interface PurchaseState {
  step: PurchaseStep;
  planId: PurchasePlanId;
  qty: number;
  mobile: string;
  /** Contact mobile entered on the address step — sent to the order API. */
  orderMobile: string;
  /** Buyer email — captured on the address step, sent to the order API. */
  email: string;
  otpSent: boolean;
  otp: string;
  name: string;
  addr: string;
  /** Optional address line 2 (landmark / area). */
  line2: string;
  pin: string;
  city: string;
  /** Shipping state / region (needed by the order-create API). */
  region: string;
  /** Promo code entered on the summary step (applied via the cart API). */
  promo: string;
  /** Latest priced cart id from `POST /v1/cart` — feeds order creation. */
  cartId: string | null;
  /** Chosen saved-address id (`/v1/addresses`) — sent as `addressId` on order create. */
  addressId: string | null;
  /** Created order id from `POST /v1/orders` — feeds pay + polling. */
  orderId: string | null;
  autoRenew: boolean;
  payMethod: PayMethod;
  plate: string;
  rcVerified: boolean;
  contact1: string;
  contact2: string;
  addRiders: boolean;
  /** Whether the buyer accepted the Privacy Policy + Terms on the verify step. */
  accepted: boolean;
}

/** Derived money figures for the selected plan + quantity. */
export interface PurchasePricing {
  subtotal: number;
  multiDiscount: boolean;
  discountAmount: number;
  total: number;
  gstIncluded: number;
}

/** Common contract every step component receives from the orchestrator. */
export interface StepProps {
  state: PurchaseState;
  plan: PurchasePlan;
  pricing: PurchasePricing;
  update: (patch: Partial<PurchaseState>) => void;
  goTo: (step: PurchaseStep) => void;
  /** Leave the flow and return to the page the buyer arrived from. */
  exitToOrigin: () => void;
  /**
   * True once the in-flow "browse all plans" step is reachable. When false the
   * buyer entered directly from a plan card, so "back" should exit to origin.
   */
  canBrowsePlans: boolean;
  /**
   * True when the buyer already holds a valid purchase session, so the phone +
   * OTP login step can be skipped entirely.
   */
  isAuthenticated: boolean;
}
