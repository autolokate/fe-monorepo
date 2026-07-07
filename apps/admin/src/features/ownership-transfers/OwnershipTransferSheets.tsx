import { zodResolver } from '@hookform/resolvers/zod';
import type { TransferCompletedDto, TransferInitiatedDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlSheet, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  approveTransferSchema,
  initiateTransferSchema,
  type ApproveTransferFormValues,
  type InitiateTransferFormValues,
} from '@/features/ownership-transfers/ownership-transfer-schemas.js';
import { useOwnershipTransferMutations } from '@/hooks/ownership-transfers/useOwnershipTransferMutations.js';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel.js';

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
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Initiate ownership transfer"
      description="POST /admin/v1/ownership-transfers — open a transfer case for a QR code."
    >
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlStack gap="lg">
          <AlInput
            label="QR code"
            mono
            autoComplete="off"
            {...form.register('code')}
            errorText={form.formState.errors.code?.message}
            helperText="Code to open an ownership-transfer case for."
          />

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}

          <AlStack gap="sm" direction="row">
            <AlButton
              type="submit"
              loading={initiateMutation.isPending}
              disabled={initiateMutation.isPending}
            >
              Initiate transfer
            </AlButton>
            <AlButton
              type="button"
              variant="secondary"
              disabled={initiateMutation.isPending}
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
  );
}

export function TransferInitiatedPanel({ result }: { result: TransferInitiatedDto }) {
  return (
    <AdminMutationResultPanel
      title="Transfer initiated"
      fields={[
        { label: 'Transfer ID', value: result.transferId },
        { label: 'Vehicle ID', value: result.vehicleId },
        { label: 'Status', value: result.status },
      ]}
    />
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
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Approve ownership transfer"
      description="POST /admin/v1/ownership-transfers/{id}/approve — re-bind to the new owner."
    >
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlStack gap="lg">
          <AlInput
            label="Transfer ID"
            mono
            autoComplete="off"
            {...form.register('transferId')}
            errorText={form.formState.errors.transferId?.message}
          />

          <AlInput
            label="New owner account ID"
            mono
            autoComplete="off"
            {...form.register('toAccountId')}
            errorText={form.formState.errors.toAccountId?.message}
            helperText="UUID of the new owner's account (OTP-verified login)."
          />

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}

          <AlStack gap="sm" direction="row">
            <AlButton
              type="submit"
              loading={approveMutation.isPending}
              disabled={approveMutation.isPending}
            >
              Approve transfer
            </AlButton>
            <AlButton
              type="button"
              variant="secondary"
              disabled={approveMutation.isPending}
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
  );
}

export function TransferCompletedPanel({ result }: { result: TransferCompletedDto }) {
  return (
    <AdminMutationResultPanel
      title="Transfer completed"
      fields={[
        { label: 'Transfer ID', value: result.transferId },
        { label: 'Vehicle ID', value: result.vehicleId },
        { label: 'New owner account', value: result.toAccountId },
        { label: 'Status', value: result.status },
      ]}
    />
  );
}
