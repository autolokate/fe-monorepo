import type { OrderSummaryTotals } from '@/features/qr-purchase/types-checkout';
import type { OrderStatus } from '@autolokate/api-client';

export type CheckoutEphemeral = {
  cartId: string | null;
  cartExpiresAt: string | null;
  planPricePaise: number | null;
  riderCoverPaise: number | null;
  discountPaise: number | null;
  appliedPromoCode: string | null;
  orderId: string | null;
  orderStatus: OrderStatus | null;
  paymentRef: string | null;
  providerOrderId: string | null;
  razorpayKeyId: string | null;
  totalPaise: number | null;
  createIdempotencyKey: string | null;
  payIdempotencyKey: string | null;
  orderSummary: OrderSummaryTotals | null;
  paramsKey: string | null;
  revision: number;
};

let state: CheckoutEphemeral = {
  cartId: null,
  cartExpiresAt: null,
  planPricePaise: null,
  riderCoverPaise: null,
  discountPaise: null,
  appliedPromoCode: null,
  orderId: null,
  orderStatus: null,
  paymentRef: null,
  providerOrderId: null,
  razorpayKeyId: null,
  totalPaise: null,
  createIdempotencyKey: null,
  payIdempotencyKey: null,
  orderSummary: null,
  paramsKey: null,
  revision: 0,
};

let inflightPrepare: Promise<unknown> | null = null;
let inflightPayment: Promise<unknown> | null = null;

export function getCheckoutRevision(): number {
  return state.revision;
}

export function peekCartId(): string | null {
  return state.cartId;
}

export function peekCheckoutSummary(): OrderSummaryTotals | null {
  return state.orderSummary;
}

export function peekOrderId(): string | null {
  return state.orderId;
}

export function peekOrderStatus(): OrderStatus | null {
  return state.orderStatus;
}

export function peekPaymentRef(): string | null {
  return state.paymentRef;
}

export function peekTotalPaise(): number | null {
  return state.totalPaise;
}

export function updateCheckoutState(patch: Partial<CheckoutEphemeral>): void {
  state = {
    ...state,
    ...patch,
    revision: state.revision + 1,
  };
}

export function resetCheckoutPaymentAttempt(): void {
  state = {
    ...state,
    paymentRef: null,
    providerOrderId: null,
    razorpayKeyId: null,
    payIdempotencyKey: null,
    revision: state.revision + 1,
  };
}

export function clearCheckoutCache(): void {
  state = {
    cartId: null,
    cartExpiresAt: null,
    planPricePaise: null,
    riderCoverPaise: null,
    discountPaise: null,
    appliedPromoCode: null,
    orderId: null,
    orderStatus: null,
    paymentRef: null,
    providerOrderId: null,
    razorpayKeyId: null,
    totalPaise: null,
    createIdempotencyKey: null,
    payIdempotencyKey: null,
    orderSummary: null,
    paramsKey: null,
    revision: state.revision + 1,
  };
  inflightPrepare = null;
  inflightPayment = null;
}

export function getInflightPrepare(): Promise<unknown> | null {
  return inflightPrepare;
}

export function setInflightPrepare(promise: Promise<unknown> | null): void {
  inflightPrepare = promise;
}

export function getInflightPayment(): Promise<unknown> | null {
  return inflightPayment;
}

export function setInflightPayment(promise: Promise<unknown> | null): void {
  inflightPayment = promise;
}

export function clearCartPricingCache(): void {
  updateCheckoutState({
    cartId: null,
    cartExpiresAt: null,
    planPricePaise: null,
    riderCoverPaise: null,
    discountPaise: null,
    appliedPromoCode: null,
    orderId: null,
    orderStatus: null,
    paymentRef: null,
    providerOrderId: null,
    razorpayKeyId: null,
    createIdempotencyKey: null,
    payIdempotencyKey: null,
    orderSummary: null,
    totalPaise: null,
    paramsKey: null,
  });
}

export function readCheckoutState(): CheckoutEphemeral {
  return state;
}
