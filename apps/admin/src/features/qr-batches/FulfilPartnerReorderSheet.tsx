import { zodResolver } from '@hookform/resolvers/zod';
import type { ReorderFulfilResultDto } from '@autolokate/api-client';
import { AlButton, AlConfirmationDialog, AlInput, AlModal } from '@autolokate/ui';
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
      fulfilReorderMutation.reset();
      return;
    }
    fulfilReorderMutation.reset();
    // Intentionally only when `open` flips — mutation identity is stable enough for reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open/close only
  }, [form, open]);

  const submitError = fulfilReorderMutation.isError
    ? mapMutationError(fulfilReorderMutation.error).userMessage
    : null;

  const openConfirm = form.handleSubmit(() => {
    setConfirmOpen(true);
  });

  const runFulfil = form.handleSubmit(async (values) => {
    if (fulfilReorderMutation.isPending) {
      return;
    }
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
      // Error surfaced via mutation state + toast; keep sheet open for retry.
    } finally {
      setConfirmOpen(false);
    }
  });

  return (
    <>
      <AlModal
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title="Fulfil partner reorder"
        description="Allocate provisioned stock to a partner reorder."
        footer={
          <div className="admin-modal-actions">
            <AlButton
              type="submit"
              form="fulfil-reorder-form"
              size="sm"
              data-testid="partner-reorder-fulfil-review"
              loading={fulfilReorderMutation.isPending}
              disabled={fulfilReorderMutation.isPending}
            >
              Review & fulfil
            </AlButton>
            <AlButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={fulfilReorderMutation.isPending}
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
          id="fulfil-reorder-form"
          className="admin-form-stack"
          onSubmit={(event) => {
            void openConfirm(event);
          }}
        >
          <AlInput
            label="Reorder reference"
            mono
            autoComplete="off"
            data-testid="partner-reorder-fulfil-id"
            {...form.register('reorderId')}
            errorText={form.formState.errors.reorderId?.message}
            helperText="PENDING reorder (QrDistribution) UUID from partner ops."
          />

          {submitError ? <p className="admin-form-error">{submitError}</p> : null}
        </form>
      </AlModal>

      <AlConfirmationDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!fulfilReorderMutation.isPending) {
            setConfirmOpen(next);
          }
        }}
        title="Fulfil partner reorder"
        description="Allocate PROVISIONED stock and confirm this reorder?"
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
        { label: 'Location', value: result.locationId },
      ]}
    />
  );
}
