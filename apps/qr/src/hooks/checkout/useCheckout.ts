import { useCallback, useState } from 'react';

import {
  getCheckoutRevision,
  pollCheckoutPayment,
  prepareCheckout,
  runCheckoutPayment,
  type CheckoutParams,
  type PaymentFlowResult,
  type PrepareCheckoutResult,
} from '@/services/checkout/checkout-service.js';

export function useCheckout() {
  const [revision, setRevision] = useState(() => getCheckoutRevision());
  const [isPending, setIsPending] = useState(false);

  const syncRevision = useCallback((result: PrepareCheckoutResult | PaymentFlowResult) => {
    if (result.ok) {
      setRevision(getCheckoutRevision());
    }
  }, []);

  const prepare = useCallback(
    async (params: CheckoutParams) => {
      setIsPending(true);
      try {
        const result = await prepareCheckout(params);
        syncRevision(result);
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [syncRevision],
  );

  const startPayment = useCallback(
    async (params: CheckoutParams) => {
      setIsPending(true);
      try {
        const result = await runCheckoutPayment(params);
        syncRevision(result);
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [syncRevision],
  );

  const pollPayment = useCallback(async (orderId: string) => {
    setIsPending(true);
    try {
      const result = await pollCheckoutPayment(orderId);
      syncRevision(result);
      return result;
    } finally {
      setIsPending(false);
    }
  }, [syncRevision]);

  return {
    prepareCheckout: prepare,
    startPayment,
    pollPayment,
    revision,
    isPending,
  };
}
