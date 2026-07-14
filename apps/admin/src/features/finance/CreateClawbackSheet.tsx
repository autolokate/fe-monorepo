import { zodResolver } from '@hookform/resolvers/zod';
import type { ClawbackResultDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlModal } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  createClawbackSchema,
  type CreateClawbackFormValues,
} from '@/features/finance/create-clawback-schema';
import { useFinanceMutations } from '@/hooks/finance/useFinanceMutations';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel';

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

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Create clawback"
      description="Reverse a captured payment and claw back its commission."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-clawback-form"
            size="sm"
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
        className="admin-form-stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlInput
          label="Payment reference"
          mono
          autoComplete="off"
          {...form.register('paymentRef')}
          errorText={form.formState.errors.paymentRef?.message}
          helperText="Opaque PaymentRef of the CAPTURED payment to reverse."
        />

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function ClawbackResultPanel({ result }: { result: ClawbackResultDto }) {
  return (
    <AdminMutationResultPanel
      title="Clawback result"
      fields={[
        { label: 'Payment reference', value: result.paymentRef },
        { label: 'Payment state', value: result.paymentState },
        { label: 'Commission status', value: result.commissionStatus ?? '—' },
      ]}
    />
  );
}
