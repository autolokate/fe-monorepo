import { formatInrFromPaise } from '@autolokate/utils';

import type {
  OrderSummaryTotals,
  PurchasePlanId,
  PurchaseRiderCount,
} from '../types-checkout.js';

import { getPurchasePlan } from './purchase-plans.js';
import { buildCheckoutParamsKey } from '@/services/checkout/checkout-mapper.js';
import { peekCheckoutSummary, readCheckoutState } from '@/services/checkout/checkout-cache.js';

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

  const totalLabel = formatInrFromPaise(totalPaise);
  const totalInr = Math.round(totalPaise / 100);

  return {
    planLine: {
      label: `${plan.name} plan`,
      value: plan.priceLabel,
    },
    riderLine,
    totalLabel,
    totalInr,
    gstNote: 'Inclusive of 18% GST',
    payCtaLabel: 'Pay securely',
  };
}

export function buildOrderSummary(params: {
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoApplied?: boolean;
  promoCode?: string | null;
}): OrderSummaryTotals {
  const cached = peekCheckoutSummary();
  const paramsKey = buildCheckoutParamsKey({
    planId: params.planId,
    riderCount: params.riderCount,
    promoApplied: params.promoApplied,
    promoCode: params.promoCode,
  });

  if (cached && readCheckoutState().paramsKey === paramsKey) {
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
