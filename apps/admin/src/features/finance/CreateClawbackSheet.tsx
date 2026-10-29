import { zodResolver } from '@hookform/resolvers/zod';
import type { ClawbackResultDto } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  createClawbackSchema,
  type CreateClawbackFormValues,
} from '@/features/finance/create-clawback-schema';
import { useFinanceMutations } from '@/hooks/finance/useFinanceMutations';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
} from '@/platform/components/AdminWowSurface';

export type CreateClawbackSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (result: ClawbackResultDto) => void;
};

export function CreateClawbackSheet({ open, onOpenChange, onCreated }: CreateClawbackSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { clawbackMutation, mapMutationError } = useFinanceMutations();

  const form = useForm<CreateClawbackFormValues>({
    resolver: zodResolver(createClawbackSchema),
    defaultValues: { paymentRef: '' },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({ paymentRef: '' });
    }
  }, [form, open]);

  const submitError = clawbackMutation.isError
    ? mapMutationError(clawbackMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await clawbackMutation.mutateAsync({
        body: { paymentRef: values.paymentRef },
        signal: controller.signal,
      });
      onCreated?.(result);
      onOpenChange(false);
    } catch {
      // Error surfaced via mutation state + toast.
    }
  });

  const paymentRefError = form.formState.errors.paymentRef?.message;

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Create clawback"
      description="Reverse a captured payment and recover its commission."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-clawback-form"
            size="sm"
            data-testid="clawback-submit"
            loading={clawbackMutation.isPending}
            disabled={clawbackMutation.isPending}
          >
            Create clawback
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={clawbackMutation.isPending}
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
        id="create-clawback-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-field admin-form-span">
            Payment reference
            <input
              data-testid="clawback-payment-ref"
              autoComplete="off"
              {...form.register('paymentRef')}
            />
            <span className="admin-field__hint">Reference of the captured payment to reverse.</span>
            {paymentRefError ? (
              <span className="admin-form-error" role="alert">
                {paymentRefError}
              </span>
            ) : null}
          </label>
        </div>

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function ClawbackResultPanel({ result }: { result: ClawbackResultDto }) {
  return (
    <AdminPanel title="Clawback result" subtitle="Outcome of the clawback you just ran.">
      <div className="admin-status-row">
        <AdminStatusChip label={humanizeAdminLabel(result.paymentState)} tone="neutral" />
        {result.commissionStatus ? (
          <AdminStatusChip label={humanizeAdminLabel(result.commissionStatus)} tone="neutral" />
        ) : null}
      </div>
      <AdminDetailGrid>
        <AdminDetailField label="Payment reference" value={result.paymentRef} mono />
        <AdminDetailField label="Payment state" value={result.paymentState} mono />
        <AdminDetailField label="Commission" value={result.commissionStatus ?? '—'} mono />
      </AdminDetailGrid>
    </AdminPanel>
  );
}
