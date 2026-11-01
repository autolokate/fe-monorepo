import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminOrderSummary, RefundOrderResult } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  classifyRefundError,
  newRefundIdempotencyKey,
  type RefundFailure,
} from '@/features/orders/refund-outcome';
import {
  refundOrderSchema,
  type RefundOrderFormValues,
} from '@/features/orders/refund-order-schema';
import { useRefundOrder } from '@/hooks/orders/useRefundOrder';

function formatInr(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export type RefundOrderDialogProps = {
  /** The order to refund; `null` closes the dialog. */
  order: AdminOrderSummary | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Confirmation-gated FULL refund for a paid order — reason + explicit confirmation required.
 *
 * Each opening of the dialog is one user-initiated attempt with its own Idempotency-Key. A retry after
 * an unknown outcome reuses that key (and freezes the reason so the body is identical); a retry after a
 * definitive no-effect failure (e.g. 502 `refund_failed`) gets a new key. 503 `vendor_unavailable`
 * blocks retry entirely. Success is only shown from the server's response, with its real state.
 */
export function RefundOrderDialog({ order, onOpenChange }: RefundOrderDialogProps) {
  const open = order !== null;
  const keyRef = useRef<string | null>(null);
  const { refundMutation, mapMutationError } = useRefundOrder();
  const [confirmed, setConfirmed] = useState(false);
  const [failure, setFailure] = useState<RefundFailure | null>(null);
  const [result, setResult] = useState<RefundOrderResult | null>(null);

  const form = useForm<RefundOrderFormValues>({
    resolver: zodResolver(refundOrderSchema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (open) {
      keyRef.current = newRefundIdempotencyKey();
    } else {
      keyRef.current = null;
      form.reset({ reason: '' });
      setConfirmed(false);
      setFailure(null);
      setResult(null);
      refundMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens/closes
  }, [open]);

  const reasonError = form.formState.errors.reason?.message;
  const pending = refundMutation.isPending;
  const blocked = failure !== null && !failure.canRetry;
  const done = result !== null;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!order || !confirmed || blocked || done) {
      return;
    }
    if (!keyRef.current) {
      keyRef.current = newRefundIdempotencyKey();
    }
    setFailure(null);
    try {
      const refund = await refundMutation.mutateAsync({
        orderId: order.orderId,
        reason: values.reason,
        idempotencyKey: keyRef.current,
      });
      setResult(refund);
    } catch (error) {
      const next = classifyRefundError(error, (e) => mapMutationError(e).userMessage);
      if (next.rotateKey) {
        keyRef.current = newRefundIdempotencyKey();
      }
      setFailure(next);
    }
  });

  const reasonLocked = failure?.lockReason === true || done;

  return (
    <AlModal
      open={open}
      onOpenChange={(next) => {
        // Never close mid-flight: aborting the fetch would not stop the server-side refund.
        if (!pending) {
          onOpenChange(next);
        }
      }}
      size="md"
      title={done ? 'Refund submitted' : 'Refund order'}
      description={
        order
          ? `Full refund of ${formatInr(order.totalPaise)} for order ${order.orderNumber}. Partial refunds are not supported.`
          : 'Refund this order in full.'
      }
      footer={
        <div className="admin-modal-actions">
          {done ? (
            <AlButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Close
            </AlButton>
          ) : (
            <>
              <AlButton
                type="submit"
                form="refund-order-form"
                variant="destructive"
                size="sm"
                data-testid="refund-order-submit"
                loading={pending}
                disabled={pending || !confirmed || blocked}
              >
                {failure?.canRetry ? 'Retry refund' : 'Refund order'}
              </AlButton>
              <AlButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={pending}
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </AlButton>
            </>
          )}
        </div>
      }
    >
      {result ? (
        <div className="admin-form-stack" data-testid="refund-order-result">
          <p>
            {result.state === 'REFUNDED'
              ? `Refunded ${formatInr(result.amountPaise)} — the payment provider processed it.`
              : `Refund of ${formatInr(result.amountPaise)} accepted and settling (REFUND_PENDING). The final state arrives from the payment provider.`}
          </p>
          <p className="admin-field__hint">
            Refund {result.refundRef ?? result.refundId}
            {result.subscriptionId ? ' · the linked subscription was stopped.' : '.'}
          </p>
        </div>
      ) : (
        <form
          id="refund-order-form"
          className="admin-form-stack"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
        >
          <label className="admin-field admin-form-span" htmlFor="refund-order-reason">
            Reason
            <textarea
              id="refund-order-reason"
              data-testid="refund-order-reason"
              rows={4}
              autoComplete="off"
              placeholder="Why is this order being refunded?"
              readOnly={reasonLocked}
              aria-invalid={reasonError ? true : undefined}
              {...form.register('reason')}
            />
            {reasonError ? (
              <span className="admin-field__hint" role="alert">
                {reasonError}
              </span>
            ) : (
              <span className="admin-field__hint">
                {reasonLocked
                  ? 'Locked so a retry repeats exactly the same request.'
                  : 'Saved with the refund. 3–500 characters.'}
              </span>
            )}
          </label>

          <label className="admin-field admin-form-span" htmlFor="refund-order-confirm">
            <span>
              <input
                id="refund-order-confirm"
                type="checkbox"
                data-testid="refund-order-confirm"
                checked={confirmed}
                disabled={pending || blocked}
                onChange={(event) => {
                  setConfirmed(event.target.checked);
                }}
              />{' '}
              I confirm a full refund
              {order ? ` of ${formatInr(order.totalPaise)}` : ''}. This stops the order’s coverage
              and cannot be undone.
            </span>
          </label>

          {failure ? (
            <p className="admin-form-error" role="alert" data-testid="refund-order-error">
              {failure.message}
            </p>
          ) : null}
        </form>
      )}
    </AlModal>
  );
}
