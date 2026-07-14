import { useCallback } from 'react';

import { buildCheckoutParamsKey, type CheckoutParams } from '@/services/checkout/checkout-mapper';
import { getCheckoutRevision } from '@/services/checkout/checkout-cache';
import { priceCheckoutCart } from '@/services/cart/index';
import { clearPlansCache } from '@/services/plan/plan-cache';
import { loadPlans } from '@/services/plan/plan-service';
import { reportUserError } from '@/platform/feedback/index';
import { checkoutLogger } from '@/services/checkout/checkout-logger';
import { useRouteLoadWithRetry } from '@/hooks/purchase/useRouteLoadWithRetry';

export function useCartPricing(params: CheckoutParams): {
  cartReady: boolean;
  cartRevision: number;
  cartError: string | null;
  retryCart: () => void;
} {
  const paramsKey = buildCheckoutParamsKey(params);

  const loadCart = useCallback(
    async ({ force }: { force: boolean }) => {
      let result = await priceCheckoutCart(params, { force });

      if (!result.ok && result.error.code === 'catalog_stale') {
        clearPlansCache();
        await loadPlans({ force: true });
        result = await priceCheckoutCart(params, { force: true });
      }

      if (!result.ok) {
        reportUserError(
          checkoutLogger,
          'price_cart_failed',
          result.error,
          result.error.message,
          { toast: false },
        );
        return { ok: false as const, message: result.error.message };
      }

      return { ok: true as const };
    },
    [params, params.planId, params.promoApplied, params.promoCode, params.riderCount],
  );

  const { loadState, retry } = useRouteLoadWithRetry({
    reloadKey: paramsKey,
    load: loadCart,
  });

  return {
    cartReady: loadState.status === 'ready',
    cartRevision: getCheckoutRevision(),
    cartError: loadState.status === 'error' ? loadState.message : null,
    retryCart: retry,
  };
}
