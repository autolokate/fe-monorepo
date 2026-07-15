import { useCallback, useState } from 'react';

import {
  pollCheckoutPayment,
  runCheckoutPayment,
  type CheckoutParams,
} from '@/services/checkout/checkout-service';
import { checkoutLogger } from '@/services/checkout/checkout-logger';

const POLL_INITIAL_MS = 1000;
const POLL_MAX_MS = 8000;
const POLL_TIMEOUT_MS = 45_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function usePaymentPolling() {
  const [isPolling, setIsPolling] = useState(false);

  /**
   * R09b / resume polling — keep calling GET /payment until PAID, FAILED, UNCONFIRMED, or timeout.
   * Must NOT stop early while backend still returns PENDING.
   */
  const pollPaymentStatus = useCallback(async (orderId: string) => {
    setIsPolling(true);
    try {
      const startedAt = Date.now();
      let delayMs = POLL_INITIAL_MS;

      while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
        const result = await pollCheckoutPayment(orderId);
        if (!result.ok) {
          return result;
        }

        if (result.paymentStatus === 'success' || result.paymentStatus === 'failed') {
          checkoutLogger.info('payment_poll_terminal', {
            orderId,
            paymentStatus: result.paymentStatus,
          });
          return result;
        }

        if (result.paymentStatus === 'unconfirmed') {
          checkoutLogger.info('payment_poll_unconfirmed', { orderId });
          return result;
        }

        await sleep(delayMs);
        delayMs = Math.min(delayMs * 2, POLL_MAX_MS);
      }

      checkoutLogger.warn('payment_poll_timeout', { orderId, timeoutMs: POLL_TIMEOUT_MS });
      return { ok: true as const, paymentStatus: 'unconfirmed' as const };
    } finally {
      setIsPolling(false);
    }
  }, []);

  const executePayment = useCallback(async (params: CheckoutParams) => {
    setIsPolling(true);
    try {
      return await runCheckoutPayment(params);
    } finally {
      setIsPolling(false);
    }
  }, []);

  return { pollPaymentStatus, executePayment, isPolling };
}
