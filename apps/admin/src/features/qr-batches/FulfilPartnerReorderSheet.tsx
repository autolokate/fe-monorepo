import { zodResolver } from '@hookform/resolvers/zod';
import type { ReorderFulfilResultDto } from '@autolokate/api-client';
import { AlButton, AlConfirmationDialog, AlModal } from '@autolokate/ui';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  fulfilPartnerReorderSchema,
  type FulfilPartnerReorderFormValues,
} from '@/features/qr-batches/fulfil-reorder-schema';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import {
  AdminKpiStrip,
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
} from '@/platform/components/AdminWowSurface';

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

  const reorderError = form.formState.errors.reorderId?.message;

  return (
    <>
      <AlModal
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title="Fulfil partner reorder"
        description="Allocate ready stock to a partner reorder request."
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
          onSubmit={(event) => {
            void openConfirm(event);
          }}
        >
          <div className="admin-form-grid">
            <label className="admin-field admin-form-span">
              Reorder reference
              <input
                data-testid="partner-reorder-fulfil-id"
                autoComplete="off"
                {...form.register('reorderId')}
              />
              <span className="admin-field__hint">
                Reference of the pending partner reorder from partner ops.
              </span>
              {reorderError ? (
                <span className="admin-form-error" role="alert">
                  {reorderError}
                </span>
              ) : null}
            </label>
          </div>

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
        description="Allocate ready stock and confirm this reorder?"
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
    <AdminPanel title="Reorder fulfilled" subtitle="Stock allocated to the partner request.">
      <div className="admin-status-row">
        <AdminStatusChip label={humanizeAdminLabel(result.status)} tone="active" />
      </div>
      <AdminKpiStrip
        items={[{ label: 'Codes allocated', value: result.allocated.toLocaleString() }]}
      />
      <AdminDetailGrid>
        <AdminDetailField label="Reorder" value={result.reorderId} mono />
        <AdminDetailField label="Location" value={result.locationId} mono />
        <AdminDetailField label="Status" value={result.status} mono />
      </AdminDetailGrid>
    </AdminPanel>
  );
}
