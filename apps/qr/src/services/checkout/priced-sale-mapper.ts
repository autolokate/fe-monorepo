import { formatInrFromPaise } from '@autolokate/utils';

import type {
  OrderSummaryTotals,
  PurchasePlanId,
  PurchaseRiderCount,
} from '@/features/qr-purchase/types-checkout';
import { getPurchasePlanById } from '@/services/plan/plan-service';

export type PricedSaleBreakdown = {
  planPricePaise: number;
  riderCoverPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedPromoCode?: string | null;
};

/** Map server-priced sale (cart or order) into the R08 order-summary card. */
export function mapPricedSaleToSummary(
  sale: PricedSaleBreakdown,
  params: { planId: PurchasePlanId; riderCount: PurchaseRiderCount },
): OrderSummaryTotals {
  const plan = getPurchasePlanById(params.planId);
  const totalLabel = formatInrFromPaise(sale.totalPaise);
  const totalInr = Math.round(sale.totalPaise / 100);

  const summary: OrderSummaryTotals = {
    planLine: {
      label: `${plan.name} plan`,
      value: formatInrFromPaise(sale.planPricePaise),
    },
    totalLabel,
    totalInr,
    gstNote: 'Inclusive of 18% GST',
    payCtaLabel: `Pay ${totalLabel}`,
  };

  if (params.riderCount > 0 && sale.riderCoverPaise > 0) {
    summary.riderLine = {
      label: `Rider cover × ${String(params.riderCount)}`,
      value: `+${formatInrFromPaise(sale.riderCoverPaise)}`,
    };
  }

  if (sale.discountPaise > 0 && sale.appliedPromoCode) {
    summary.promoLine = {
      label: `Promo · ${sale.appliedPromoCode}`,
      value: `−${formatInrFromPaise(sale.discountPaise)}`,
      tone: 'promo',
    };
  }

  return summary;
}
