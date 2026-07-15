'use client';

import { useEffect, useRef, useState } from 'react';
import { getOrderPayment, type PaymentOutcome } from '@/services/purchase';

const TERMINAL: PaymentOutcome[] = ['PAID', 'FAILED', 'REFUNDED'];

export interface UseOrderPaymentResult {
  outcome: PaymentOutcome | null;
  isSettled: boolean;
  isPolling: boolean;
}

/**
 * Polls `GET /v1/orders/:id/payment` until the payment reaches a terminal
 * state (PAID / FAILED / REFUNDED). Razorpay captures via webhook, so the
 * outcome lands here a beat after the buyer finishes at the gateway.
 */
export function useOrderPayment(orderId: string | null, intervalMs = 3000): UseOrderPaymentResult {
  const [outcome, setOutcome] = useState<PaymentOutcome | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setOutcome(null);
    if (!orderId) {
      setIsPolling(false);
      return;
    }

    let active = true;
    setIsPolling(true);

    const stop = () => {
      active = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const tick = async () => {
      try {
        const next = await getOrderPayment(orderId);
        if (!active) return;
        setOutcome(next);
        if (TERMINAL.includes(next)) {
          setIsPolling(false);
          return;
        }
      } catch {
        // Transient failure — keep polling.
      }
      if (active) timerRef.current = window.setTimeout(tick, intervalMs);
    };

    void tick();
    return stop;
  }, [orderId, intervalMs]);

  return {
    outcome,
    isSettled: outcome ? TERMINAL.includes(outcome) : false,
    isPolling,
  };
}
