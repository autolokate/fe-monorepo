import type { PaymentOutcome } from '@autolokate/api-client';

/** Backend payment poll outcomes from GET /v1/orders/{id}/payment. */
export const PAYMENT_OUTCOME = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  UNCONFIRMED: 'UNCONFIRMED',
} as const satisfies Record<string, PaymentOutcome>;

export function isPendingPaymentOutcome(outcome: PaymentOutcome): boolean {
  return outcome === PAYMENT_OUTCOME.PENDING;
}
