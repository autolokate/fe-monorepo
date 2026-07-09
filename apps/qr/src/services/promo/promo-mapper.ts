import type { PromoPreviewDto } from '@autolokate/api-client';
import { formatInrFromPaise } from '@autolokate/utils';

import type { OrderSummaryTotals, PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout.js';
import { getPurchasePlanById } from '@/services/plan/plan-service.js';

export function mapPromoPreviewToSummary(
  preview: PromoPreviewDto,
  params: { planId: PurchasePlanId; riderCount: PurchaseRiderCount },
): OrderSummaryTotals {
  const plan = getPurchasePlanById(params.planId);
  const totalLabel = formatInrFromPaise(preview.totalPaise);

  const summary: OrderSummaryTotals = {
    planLine: {
      label: `${plan.name} plan`,
      value: plan.priceLabel,
    },
    totalLabel,
    totalInr: Math.round(preview.totalPaise / 100),
    gstNote: 'Inclusive of 18% GST',
    payCtaLabel: `Pay ${totalLabel}`,
  };

  if (params.riderCount > 0) {
    const riderOption = plan.riderOptions.find((option) => option.riderCount === params.riderCount);
    summary.riderLine = {
      label: `Rider cover × ${String(params.riderCount)}`,
      value: riderOption ? `+${formatInrFromPaise(riderOption.pricePaise)}` : 'Included',
    };
  }

  if (preview.discountPaise > 0) {
    summary.promoLine = {
      label: `Promo · ${preview.promoCode}`,
      value: `−${formatInrFromPaise(preview.discountPaise)}`,
      tone: 'promo',
    };
  }

  return summary;
}
