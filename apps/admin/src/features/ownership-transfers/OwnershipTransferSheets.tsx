import { zodResolver } from '@hookform/resolvers/zod';
import type { TransferCompletedDto, TransferInitiatedDto } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  approveTransferSchema,
  initiateTransferSchema,
  type ApproveTransferFormValues,
  type InitiateTransferFormValues,
} from '@/features/ownership-transfers/ownership-transfer-schemas';
import { useOwnershipTransferMutations } from '@/hooks/ownership-transfers/useOwnershipTransferMutations';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';

export type InitiateTransferSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInitiated?: (result: TransferInitiatedDto) => void;
};

export function InitiateTransferSheet({
  open,
  onOpenChange,
  onInitiated,
}: InitiateTransferSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { initiateMutation, mapMutationError } = useOwnershipTransferMutations();

  const form = useForm<InitiateTransferFormValues>({
    resolver: zodResolver(initiateTransferSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({ code: '' });
    }
  }, [form, open]);

  const submitError = initiateMutation.isError
    ? mapMutationError(initiateMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await initiateMutation.mutateAsync({
        body: { code: values.code },
        signal: controller.signal,
      });
      onInitiated?.(result);
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
      title="Initiate ownership transfer"
      description="Start a transfer for a vehicle QR code."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="initiate-transfer-form"
            size="sm"
            loading={initiateMutation.isPending}
            disabled={initiateMutation.isPending}
          >
            Initiate transfer
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={initiateMutation.isPending}
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
        id="initiate-transfer-form"
        className="admin-form-grid"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <label className="admin-field admin-form-span">
          QR code
          <input
            autoComplete="off"
            {...form.register('code')}
            disabled={initiateMutation.isPending}
          />
          {form.formState.errors.code?.message ? (
            <span className="admin-form-error">{form.formState.errors.code.message}</span>
          ) : (
            <span className="admin-field__hint">Code that opens the ownership-transfer case.</span>
          )}
        </label>

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function TransferInitiatedPanel({ result }: { result: TransferInitiatedDto }) {
  return (
    <AdminDetailSection
      title="Transfer initiated"
      description="Peer can approve once the new owner account is ready."
    >
      <div className="admin-status-row">
        <AdminStatusChip label={humanizeAdminLabel(result.status)} tone="draft" />
      </div>
      <AdminDetailGrid>
        <AdminDetailField label="Transfer" value={shortAdminId(result.transferId)} mono />
        <AdminDetailField label="Vehicle" value={shortAdminId(result.vehicleId)} mono />
      </AdminDetailGrid>
    </AdminDetailSection>
  );
}

export type ApproveTransferSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTransferId?: string;
  onApproved?: (result: TransferCompletedDto) => void;
};

export function ApproveTransferSheet({
  open,
  onOpenChange,
  defaultTransferId = '',
  onApproved,
}: ApproveTransferSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { approveMutation, mapMutationError } = useOwnershipTransferMutations();

  const form = useForm<ApproveTransferFormValues>({
    resolver: zodResolver(approveTransferSchema),
    defaultValues: { transferId: defaultTransferId, toAccountId: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ transferId: defaultTransferId, toAccountId: '' });
    } else {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({ transferId: '', toAccountId: '' });
    }
  }, [defaultTransferId, form, open]);

  const submitError = approveMutation.isError
    ? mapMutationError(approveMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await approveMutation.mutateAsync({
        transferId: values.transferId,
        body: { toAccountId: values.toAccountId },
        signal: controller.signal,
      });
      onApproved?.(result);
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
      title="Approve ownership transfer"
      description="Complete the transfer and assign the vehicle to the new owner."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="approve-transfer-form"
            size="sm"
            loading={approveMutation.isPending}
            disabled={approveMutation.isPending}
          >
            Approve transfer
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={approveMutation.isPending}
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
        id="approve-transfer-form"
        className="admin-form-grid"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <label className="admin-field">
          Transfer reference
          <input
            autoComplete="off"
            {...form.register('transferId')}
            disabled={approveMutation.isPending}
          />
          {form.formState.errors.transferId?.message ? (
            <span className="admin-form-error">{form.formState.errors.transferId.message}</span>
          ) : (
            <span className="admin-field__hint">
              From the initiate result or your ops workflow.
            </span>
          )}
        </label>

        <label className="admin-field">
          New owner account
          <input
            autoComplete="off"
            {...form.register('toAccountId')}
            disabled={approveMutation.isPending}
          />
          {form.formState.errors.toAccountId?.message ? (
            <span className="admin-form-error">{form.formState.errors.toAccountId.message}</span>
          ) : (
            <span className="admin-field__hint">Account for the new owner.</span>
          )}
        </label>

        {submitError ? <p className="admin-form-error admin-form-span">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function TransferCompletedPanel({ result }: { result: TransferCompletedDto }) {
  return (
    <AdminDetailSection
      title="Transfer completed"
      description="Vehicle ownership now points at the new owner."
    >
      <div className="admin-status-row">
        <AdminStatusChip label={humanizeAdminLabel(result.status)} tone="active" />
      </div>
      <AdminDetailGrid>
        <AdminDetailField label="Transfer" value={shortAdminId(result.transferId)} mono />
        <AdminDetailField label="Vehicle" value={shortAdminId(result.vehicleId)} mono />
        <AdminDetailField label="New owner" value={shortAdminId(result.toAccountId)} mono />
      </AdminDetailGrid>
    </AdminDetailSection>
  );
}
