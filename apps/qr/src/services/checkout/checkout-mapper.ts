import type { CreateOrderBody, OrderDto, PaymentOutcome } from '@autolokate/api-client';

import type {
  OrderSummaryTotals,
  PurchasePaymentStatus,
  PurchasePlanId,
  PurchaseRiderCount,
} from '@/features/qr-purchase/types-checkout';

import { readCheckoutState } from './checkout-cache';
import { mapPricedSaleToSummary } from './priced-sale-mapper';
import { PAYMENT_OUTCOME } from './payment-outcome';

export type CheckoutParams = {
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoApplied?: boolean;
  promoCode?: string | null;
};

export function buildCheckoutParamsKey(params: CheckoutParams): string {
  const promoCode = params.promoApplied ? (params.promoCode?.trim().toUpperCase() ?? '') : '';
  return `${params.planId}:${String(params.riderCount)}:${params.promoApplied ? '1' : '0'}:${promoCode}`;
}

export function mapCheckoutParamsToCreateOrderBody(cartId: string): CreateOrderBody {
  return { cartId };
}

/** Map authoritative order totals into the R08 summary card (plan/rider lines from cart). */
export function mapOrderToSummary(order: OrderDto, params: CheckoutParams): OrderSummaryTotals {
  const priced = readCheckoutState();

  return mapPricedSaleToSummary(
    {
      planPricePaise: priced.planPricePaise ?? 0,
      riderCoverPaise: priced.riderCoverPaise ?? 0,
      discountPaise: order.discountPaise,
      totalPaise: order.totalPaise,
      appliedPromoCode: order.appliedPromoCode ?? priced.appliedPromoCode,
    },
    params,
  );
}

export function mapPaymentOutcomeToStatus(outcome: PaymentOutcome): PurchasePaymentStatus | 'timeout' {
  switch (outcome) {
    case PAYMENT_OUTCOME.PAID:
      return 'success';
    case PAYMENT_OUTCOME.FAILED:
    case PAYMENT_OUTCOME.REFUNDED:
      return 'failed';
    case PAYMENT_OUTCOME.UNCONFIRMED:
      return 'unconfirmed';
    case PAYMENT_OUTCOME.PENDING:
      return 'processing';
    default:
      return 'processing';
  }
}

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}
