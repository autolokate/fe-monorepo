import { ApiError } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import { classifyRefundError, newRefundIdempotencyKey } from '@/features/orders/refund-outcome';

const fallback = () => 'fallback';

describe('classifyRefundError', () => {
  it('409 order_not_refundable blocks retry', () => {
    const out = classifyRefundError(new ApiError('x', 409, 'order_not_refundable'), fallback);
    expect(out).toMatchObject({ kind: 'not_refundable', canRetry: false });
  });

  it('502 refund_failed allows a retry with a NEW key', () => {
    const out = classifyRefundError(new ApiError('x', 502, 'refund_failed'), fallback);
    expect(out).toMatchObject({ kind: 'provider_declined', canRetry: true, rotateKey: true });
  });

  it('503 vendor_unavailable forbids retry and keeps the key (outcome unknown)', () => {
    const out = classifyRefundError(new ApiError('x', 503, 'vendor_unavailable'), fallback);
    expect(out).toMatchObject({ kind: 'vendor_unavailable', canRetry: false, rotateKey: false });
    expect(out.message).toMatch(/do not retry/i);
    expect(out.message).toMatch(/reconciliation/i);
  });

  it('network failure retries with the SAME key and a frozen reason', () => {
    const out = classifyRefundError(new TypeError('Failed to fetch'), fallback);
    expect(out).toMatchObject({
      kind: 'outcome_unknown',
      canRetry: true,
      rotateKey: false,
      lockReason: true,
    });
  });

  it('400 shows the server message and starts a fresh attempt', () => {
    const out = classifyRefundError(new ApiError('reason too short', 400, 'validation'), fallback);
    expect(out).toMatchObject({ kind: 'rejected', message: 'reason too short', rotateKey: true });
  });
});

describe('newRefundIdempotencyKey', () => {
  it('returns distinct UUID v4 values', () => {
    const a = newRefundIdempotencyKey();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(newRefundIdempotencyKey()).not.toBe(a);
  });
});
