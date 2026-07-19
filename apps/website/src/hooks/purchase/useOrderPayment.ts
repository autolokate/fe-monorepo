'use client';

import { useEffect, useRef, useState } from 'react';
import { getOrderPayment, type PaymentOutcome } from '@/services/purchase';

const TERMINAL: PaymentOutcome[] = ['PAID', 'FAILED', 'REFUNDED'];

/**
 * How long to keep polling before telling the buyer we'll follow up. The happy
 * path is a webhook that lands in seconds; if it hasn't, the backend's
 * `webhook-reconcile` sweep is the safety net and it only runs every 5 minutes,
 * so no amount of extra polling here beats it. Stopping at 2 minutes keeps the
 * spinner well inside the honest window and hands over before that sweep.
 */
const MAX_POLL_MS = 120_000;

export interface UseOrderPaymentResult {
  outcome: PaymentOutcome | null;
  /**
   * The buyer-facing order number (`ALK-2627-000123`), present on every outcome
   * once the first poll lands. Null before that, never a UUID stand-in.
   */
  orderNumber: string | null;
  /** The gateway's transaction number. Null until the gateway reports the attempt. */
  transactionRef: string | null;
  /** What was charged, GST-inclusive paise. Null before the first poll lands. */
  totalPaise: number | null;
  isSettled: boolean;
  isPolling: boolean;
  /** True once polling stopped at the cap without a terminal outcome. */
  timedOut: boolean;
}

/**
 * Polls `GET /v1/orders/:id/payment` until the payment reaches a terminal
 * state (PAID / FAILED / REFUNDED). Razorpay captures via webhook, so the
 * outcome lands here a beat after the buyer finishes at the gateway. Polling is
 * bounded by `maxWaitMs`; past that `timedOut` goes true so the caller can stop
 * showing a spinner for a payment that is settling out of band.
 */
export function useOrderPayment(
  orderId: string | null,
  intervalMs = 3000,
  maxWaitMs = MAX_POLL_MS,
): UseOrderPaymentResult {
  const [outcome, setOutcome] = useState<PaymentOutcome | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [totalPaise, setTotalPaise] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setOutcome(null);
    setOrderNumber(null);
    setTransactionRef(null);
    setTotalPaise(null);
    setTimedOut(false);
    if (!orderId) {
      setIsPolling(false);
      return;
    }

    let active = true;
    setIsPolling(true);
    const deadline = Date.now() + maxWaitMs;

    const stop = () => {
      active = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const tick = async () => {
      try {
        const next = await getOrderPayment(orderId);
        if (!active) return;
        setOutcome(next.outcome);
        setOrderNumber(next.orderNumber);
        setTotalPaise(next.totalPaise);
        // The gateway ref only appears once the attempt is reported; never let a
        // later poll blank one we already showed.
        if (next.transactionRef) setTransactionRef(next.transactionRef);
        if (TERMINAL.includes(next.outcome)) {
          setIsPolling(false);
          return;
        }
      } catch {
        // Transient failure, keep polling.
      }
      if (!active) return;
      if (Date.now() >= deadline) {
        setIsPolling(false);
        setTimedOut(true);
        return;
      }
      timerRef.current = window.setTimeout(() => void tick(), intervalMs);
    };

    void tick();
    return stop;
  }, [orderId, intervalMs, maxWaitMs]);

  return {
    outcome,
    orderNumber,
    transactionRef,
    totalPaise,
    isSettled: outcome ? TERMINAL.includes(outcome) : false,
    isPolling,
    timedOut,
  };
}
