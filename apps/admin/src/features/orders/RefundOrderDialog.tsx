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

/** Confirmation-gated full refund for a paid order — reason is required. */
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
          ? `Refund the full ${formatInr(order.totalPaise)} for order ${order.orderNumber}.`
          : 'Refund this order in full.'
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="refund-order-form"
            variant="destructive"
            size="sm"
            data-testid="refund-order-submit"
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
        <label className="admin-field admin-form-span" htmlFor="refund-order-reason">
          Reason
          <textarea
            id="refund-order-reason"
            data-testid="refund-order-reason"
            rows={4}
            autoComplete="off"
            placeholder="Why is this order being refunded?"
            aria-invalid={reasonError ? true : undefined}
            {...form.register('reason')}
          />
          {reasonError ? (
            <span className="admin-field__hint" role="alert">
              {reasonError}
            </span>
          ) : (
            <span className="admin-field__hint">Saved with the refund. 3–500 characters.</span>
          )}
        </label>

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}
