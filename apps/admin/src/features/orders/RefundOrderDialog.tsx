import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminOrderSummary } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

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

/** Confirmation-gated full refund for a PAID order — a money mutation, so the reason is required. */
export function RefundOrderDialog({ order, onOpenChange }: RefundOrderDialogProps) {
  const open = order !== null;
  const abortRef = useRef<AbortController | null>(null);
  const { refundMutation, mapMutationError } = useRefundOrder();

  const form = useForm<RefundOrderFormValues>({
    resolver: zodResolver(refundOrderSchema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({ reason: '' });
    }
  }, [form, open]);

  const submitError = refundMutation.isError
    ? mapMutationError(refundMutation.error).userMessage
    : null;

  const reasonError = form.formState.errors.reason?.message;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!order) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await refundMutation.mutateAsync({
        orderId: order.orderId,
        reason: values.reason,
        signal: controller.signal,
      });
      onOpenChange(false);
    } catch {
      // Error surfaced via mutation state + toast.
    }
  });

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Refund order"
      description={
        order
          ? `This issues a full refund of ${formatInr(order.totalPaise)} for order ${order.orderNumber}.`
          : 'This issues a full refund.'
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="refund-order-form"
            variant="destructive"
            size="sm"
            loading={refundMutation.isPending}
            disabled={refundMutation.isPending}
          >
            Refund order
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={refundMutation.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </div>
      }
    >
      <form
        id="refund-order-form"
        className="admin-form-stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div className={reasonError ? 'al-field al-field--error' : 'al-field'}>
          <label className="al-field__label" htmlFor="refund-order-reason">
            Reason
          </label>
          <div className="al-field__control">
            <textarea
              id="refund-order-reason"
              className="al-field__input"
              rows={4}
              autoComplete="off"
              placeholder="Why is this order being refunded?"
              aria-invalid={reasonError ? true : undefined}
              {...form.register('reason')}
            />
          </div>
          {reasonError ? (
            <span className="al-field__error" role="alert">
              {reasonError}
            </span>
          ) : (
            <span className="al-field__hint">Recorded against the refund. 3–500 characters.</span>
          )}
        </div>

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}
