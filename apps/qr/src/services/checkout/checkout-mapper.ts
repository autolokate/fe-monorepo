import type { CreateOrderBody, OrderDto, PaymentOutcome } from '@autolokate/api-client';
import { formatInrFromPaise } from '@autolokate/utils';

import type {
  OrderSummaryTotals,
  PurchasePaymentStatus,
  PurchasePlanId,
  PurchaseRiderCount,
} from '@/features/qr-purchase/types-checkout';
import { getPurchasePlanById } from '@/services/plan/plan-service';
import { mapPurchasePlanIdToApiTier } from '@/services/plan/plan-mapper';

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

export function mapCheckoutParamsToCreateOrderBody(
  params: CheckoutParams,
  purchaseQrCode: string,
): CreateOrderBody {
  const body: CreateOrderBody = {
    code: purchaseQrCode,
    planTier: mapPurchasePlanIdToApiTier(params.planId),
    riderCount: params.riderCount,
  };

  if (params.promoApplied && params.promoCode?.trim()) {
    return { ...body, promoCode: params.promoCode.trim().toUpperCase() };
  }

  return body;
}

/** Map backend order total into existing order-summary card shape (formatting only). */
export function mapOrderToSummary(
  order: OrderDto,
  params: CheckoutParams,
): OrderSummaryTotals {
  const plan = getPurchasePlanById(params.planId);
  const totalInr = Math.round(order.totalPaise / 100);
  const totalLabel = formatInrFromPaise(order.totalPaise);

  const summary: OrderSummaryTotals = {
    planLine: {
      label: `${plan.name} plan`,
      value: plan.priceLabel,
    },
    totalLabel,
    totalInr,
    gstNote: 'Inclusive of 18% GST',
    payCtaLabel: `Pay ${totalLabel}`,
  };

  if (params.riderCount > 0) {
    summary.riderLine = {
      label: `Rider cover × ${String(params.riderCount)}`,
      value: 'Included',
    };
  }

  if (params.promoApplied && params.promoCode) {
    summary.promoLine = {
      label: `Promo · ${params.promoCode}`,
      value: 'Applied',
      tone: 'promo',
    };
  }

  return summary;
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
