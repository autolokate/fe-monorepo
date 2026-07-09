import { zodResolver } from '@hookform/resolvers/zod';
import type { ReorderFulfilResultDto } from '@autolokate/api-client';
import { AlButton, AlConfirmationDialog, AlInput, AlSheet, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  fulfilPartnerReorderSchema,
  type FulfilPartnerReorderFormValues,
} from '@/features/qr-batches/fulfil-reorder-schema';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel';

export type FulfilPartnerReorderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFulfilled?: (result: ReorderFulfilResultDto) => void;
};

export function FulfilPartnerReorderSheet({
  open,
  onOpenChange,
  onFulfilled,
}: FulfilPartnerReorderSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { fulfilReorderMutation, mapMutationError } = useQrBatchMutations();

  const form = useForm<FulfilPartnerReorderFormValues>({
    resolver: zodResolver(fulfilPartnerReorderSchema),
    defaultValues: { reorderId: '' },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({ reorderId: '' });
      setConfirmOpen(false);
    }
  }, [form, open]);

  const submitError = fulfilReorderMutation.isError
    ? mapMutationError(fulfilReorderMutation.error).userMessage
    : null;

  const runFulfil = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await fulfilReorderMutation.mutateAsync({
        reorderId: values.reorderId,
        signal: controller.signal,
      });
      onFulfilled?.(result);
      onOpenChange(false);
    } catch {
      // Error surfaced via mutation state + toast.
    } finally {
      setConfirmOpen(false);
    }
  });

  return (
    <>
      <AlSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Fulfil partner reorder"
        description="Allocate provisioned stock to a partner reorder."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setConfirmOpen(true);
          }}
        >
          <AlStack gap="lg">
            <AlText tone="muted">
              Enter the pending reorder ID from your partner operations workflow.
            </AlText>

            <AlInput
              label="Reorder ID"
              mono
              autoComplete="off"
              {...form.register('reorderId')}
              errorText={form.formState.errors.reorderId?.message}
            />

            {submitError ? <AlText role="alert">{submitError}</AlText> : null}

            <AlStack gap="sm" direction="row">
              <AlButton
                type="submit"
                loading={fulfilReorderMutation.isPending}
                disabled={fulfilReorderMutation.isPending}
              >
                Review & fulfil
              </AlButton>
              <AlButton
                type="button"
                variant="secondary"
                disabled={fulfilReorderMutation.isPending}
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </AlButton>
            </AlStack>
          </AlStack>
        </form>
      </AlSheet>

      <AlConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Fulfil partner reorder"
        description={`Allocate PROVISIONED stock and confirm reorder ${form.getValues('reorderId') || ''}?`}
        confirmLabel="Fulfil reorder"
        loading={fulfilReorderMutation.isPending}
        onConfirm={() => {
          void runFulfil();
        }}
      />
    </>
  );
}

export function ReorderFulfilResultPanel({ result }: { result: ReorderFulfilResultDto }) {
  return (
    <AdminMutationResultPanel
      title="Reorder fulfilled"
      fields={[
        { label: 'Reorder ID', value: result.reorderId },
        { label: 'Status', value: result.status },
        { label: 'Allocated codes', value: result.allocated.toLocaleString() },
        { label: 'Location ID', value: result.locationId },
      ]}
    />
  );
}