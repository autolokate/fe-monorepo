import { formatInrFromPaise } from '@autolokate/utils';

import type {
  OrderSummaryTotals,
  PurchasePlanId,
  PurchaseRiderCount,
} from '../types-checkout.js';

import { getPurchasePlan, VALID_PROMO_CODE } from './purchase-plans.js';
import { getCheckoutSummary } from '@/services/checkout/checkout-service.js';

/** Demo promo discount shown on R08b before backend order total is available. */
const PROMO_DISCOUNT_PAISE = 10_000;

export function formatInr(amount: number, suffix = ''): string {
  const formatted = amount.toLocaleString('en-IN');
  return suffix ? `₹${formatted}${suffix}` : `₹${formatted}`;
}

export function getRiderCtaLabel(riderCount: Exclude<PurchaseRiderCount, 0>): string {
  return riderCount === 1 ? 'Add 1 rider' : 'Add 2 riders';
}

function buildPreviewOrderSummary(params: {
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoApplied?: boolean;
  promoCode?: string | null;
}): OrderSummaryTotals {
  const plan = getPurchasePlan(params.planId);
  let totalPaise = plan.pricePaise;

  let riderLine: OrderSummaryTotals['riderLine'];
  if (params.riderCount > 0) {
    const riderOption = plan.riderOptions.find((option) => option.riderCount === params.riderCount);
    if (riderOption) {
      totalPaise += riderOption.pricePaise;
      riderLine = {
        label: `Rider cover × ${String(params.riderCount)}`,
        value: `+${formatInrFromPaise(riderOption.pricePaise)}`,
      };
    }
  }

  const promoCode = params.promoCode?.trim().toUpperCase() ?? '';
  const promoApplied =
    params.promoApplied &&
    promoCode.length > 0 &&
    promoCode === VALID_PROMO_CODE;

  let promoLine: OrderSummaryTotals['promoLine'];
  if (promoApplied) {
    totalPaise = Math.max(0, totalPaise - PROMO_DISCOUNT_PAISE);
    promoLine = {
      label: `Promo · ${promoCode}`,
      value: `−${formatInrFromPaise(PROMO_DISCOUNT_PAISE)}`,
      tone: 'promo',
    };
  }

  const totalLabel = formatInrFromPaise(totalPaise);
  const totalInr = Math.round(totalPaise / 100);

  return {
    planLine: {
      label: `${plan.name} plan`,
      value: plan.priceLabel,
    },
    riderLine,
    promoLine,
    totalLabel,
    totalInr,
    gstNote: 'Inclusive of 18% GST',
    payCtaLabel: promoApplied ? `Pay ${totalLabel}` : 'Pay securely',
  };
}

export function buildOrderSummary(params: {
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoApplied?: boolean;
  promoCode?: string | null;
}): OrderSummaryTotals {
  const cached = getCheckoutSummary();
  if (cached) {
    return cached;
  }

  return buildPreviewOrderSummary(params);
}

export function getPlanContextLabel(planId: PurchasePlanId): string {
  const plan = getPurchasePlan(planId);
  return `${plan.name} plan · ${plan.priceLabel}`;
}

export function getPaymentSuccessDescription(planId: PurchasePlanId, totalInr: number): string {
  const plan = getPurchasePlan(planId);
  return `${formatInr(totalInr)} paid · your ${plan.name} plan is now active`;
}

export function getActivationCompleteTitle(planId: PurchasePlanId): string {
  const plan = getPurchasePlan(planId);
  return `${plan.name} is active`;
}

/** Figma 171:59 — "{plate} is now protected by {plan}. Crash detection is live" */
export function getActivationCompleteSubtitle(
  planId: PurchasePlanId,
  plateDisplay?: string,
): string {
  const plan = getPurchasePlan(planId);
  if (plateDisplay) {
    return `${plateDisplay} is now protected by ${plan.name}. Crash detection is live`;
  }
  return `Your vehicle is now protected by ${plan.name}. Crash detection is live`;
}

/** Figma 171:59 AlChip/Green — "{plan} · active" */
export function getActivationCompleteChipLabel(planId: PurchasePlanId): string {
  const plan = getPurchasePlan(planId);
  return `${plan.name} · active`;
}
