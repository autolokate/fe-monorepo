import { ApiError, isStepUpRequiredError } from '@autolokate/api-client';

/**
 * How the refund dialog must react to a failed attempt. Money is at stake, so each outcome decides
 * three things explicitly:
 * - `canRetry`: whether the submit button stays enabled;
 * - `rotateKey`: whether the next attempt needs a NEW Idempotency-Key (the previous attempt definitely
 *   had no effect) or must REUSE it (outcome unknown — the server replays instead of refunding twice);
 * - `lockReason`: when the key is reused, the body must be byte-identical, so the reason is frozen.
 */
export type RefundFailure = {
  kind:
    | 'not_refundable'
    | 'provider_declined'
    | 'vendor_unavailable'
    | 'idempotency_conflict'
    | 'outcome_unknown'
    | 'rejected';
  message: string;
  canRetry: boolean;
  rotateKey: boolean;
  lockReason: boolean;
};

export function classifyRefundError(
  error: unknown,
  fallbackMessage: (error: unknown) => string,
): RefundFailure {
  if (error instanceof ApiError) {
    if (error.code === 'order_not_refundable') {
      return {
        kind: 'not_refundable',
        message:
          'This order can’t be refunded — it is not a paid order with a captured payment, or it was already refunded.',
        canRetry: false,
        rotateKey: true,
        lockReason: false,
      };
    }
    if (error.code === 'refund_failed' || error.status === 502) {
      return {
        kind: 'provider_declined',
        message:
          'The payment provider declined the refund. Nothing was refunded. You can try again as a new attempt.',
        canRetry: true,
        rotateKey: true,
        lockReason: false,
      };
    }
    if (error.code === 'vendor_unavailable' || error.status === 503) {
      return {
        kind: 'vendor_unavailable',
        message:
          'The payment provider did not respond, so the refund outcome is UNKNOWN. Do not retry — this order has been flagged for reconciliation. Check Payments later for the final state.',
        canRetry: false,
        rotateKey: false,
        lockReason: true,
      };
    }
    if (error.code === 'conflict_idempotency') {
      return {
        kind: 'idempotency_conflict',
        message:
          'This refund attempt was already submitted with different details. Close the dialog and check the order before trying again.',
        canRetry: false,
        rotateKey: false,
        lockReason: true,
      };
    }
    // A definitive refusal before any money moved (validation, auth, step-up, not found): fix and retry
    // as a fresh attempt.
    if (error.status >= 400 && error.status < 500) {
      return {
        kind: 'rejected',
        message:
          error.status === 400 && !isStepUpRequiredError(error) && error.message.trim()
            ? error.message
            : fallbackMessage(error),
        canRetry: true,
        rotateKey: true,
        lockReason: false,
      };
    }
  }
  // Network failure, timeout, or an unexpected 5xx: the server may or may not have refunded. Retrying
  // with the SAME key and SAME body is safe — the server replays the stored result.
  return {
    kind: 'outcome_unknown',
    message:
      'We couldn’t confirm the result. Retrying is safe: it reuses this attempt and cannot refund twice.',
    canRetry: true,
    rotateKey: false,
    lockReason: true,
  };
}

/** UUID v4 for the `Idempotency-Key` header — one per user-initiated refund attempt. */
export function newRefundIdempotencyKey(): string {
  return crypto.randomUUID();
}
