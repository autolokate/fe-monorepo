import { useEffect, useState } from 'react';

import { buildCheckoutParamsKey, type CheckoutParams } from '@/services/checkout/checkout-mapper';
import { getCheckoutRevision } from '@/services/checkout/checkout-cache';
import { priceCheckoutCart } from '@/services/cart/index';
import { clearPlansCache } from '@/services/plan/plan-cache';
import { loadPlans } from '@/services/plan/plan-service';
import { reportUserError } from '@/platform/feedback/index';
import { checkoutLogger } from '@/services/checkout/checkout-logger';

export function useCartPricing(params: CheckoutParams): {
  cartReady: boolean;
  cartRevision: number;
} {
  const paramsKey = buildCheckoutParamsKey(params);
  const [cartRevision, setCartRevision] = useState(getCheckoutRevision());
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCartReady(false);

    void (async () => {
      let result = await priceCheckoutCart(params);

      if (!cancelled && !result.ok && result.error.code === 'catalog_stale') {
        clearPlansCache();
        await loadPlans();
        result = await priceCheckoutCart(params, { force: true });
      }

      if (cancelled) {
        return;
      }

      setCartRevision(getCheckoutRevision());
      if (result.ok) {
        setCartReady(true);
        return;
      }

      reportUserError(
        checkoutLogger,
        'price_cart_failed',
        result.error,
        result.error.message,
      );
      setCartReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [paramsKey, params.planId, params.riderCount, params.promoApplied, params.promoCode]);

  return { cartReady, cartRevision };
}
