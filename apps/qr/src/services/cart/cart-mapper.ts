import type { CartDto } from '@autolokate/api-client';

import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout';
import { mapPricedSaleToSummary } from '@/services/checkout/priced-sale-mapper';

export function mapCartToSummary(
  cart: CartDto,
  params: { planId: PurchasePlanId; riderCount: PurchaseRiderCount },
) {
  return mapPricedSaleToSummary(
    {
      planPricePaise: cart.planPricePaise,
      riderCoverPaise: cart.riderCoverPaise,
      discountPaise: cart.discountPaise,
      totalPaise: cart.totalPaise,
      appliedPromoCode: cart.appliedPromoCode,
    },
    params,
  );
}
