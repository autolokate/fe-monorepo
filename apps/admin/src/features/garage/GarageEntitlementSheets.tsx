import { zodResolver } from '@hookform/resolvers/zod';
import type {
  GarageFreeBidsBalanceDto,
  GaragePassGrantResultDto,
  ProvisionGarageResultDto,
} from '@autolokate/api-client';
import { AlButton, AlInput, AlModal } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  adjustGarageFreeBidsSchema,
  grantGaragePassSchema,
  provisionGarageSchema,
  toAdjustFreeBidsBody,
  toGrantPassBody,
  toProvisionGarageBody,
  type AdjustGarageFreeBidsFormValues,
  type GrantGaragePassFormValues,
  type ProvisionGarageFormValues,
} from '@/features/garage/garage-entitlement-schemas';
import { useGarageEntitlementMutations } from '@/hooks/garage/useGarageEntitlementMutations';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel';

export type GrantPassSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGranted?: (result: GaragePassGrantResultDto) => void;
};

export function GrantPassSheet({ open, onOpenChange, onGranted }: GrantPassSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { grantPassMutation, mapMutationError } = useGarageEntitlementMutations();

  const form = useForm<GrantGaragePassFormValues>({
    resolver: zodResolver(grantGaragePassSchema),
    defaultValues: { orgId: '', kind: 'DAY', idempotencyKey: '' },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({ orgId: '', kind: 'DAY', idempotencyKey: '' });
    }
  }, [form, open]);

  const submitError = grantPassMutation.isError
    ? mapMutationError(grantPassMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await grantPassMutation.mutateAsync({
        orgId: values.orgId,
        body: toGrantPassBody(values),
        signal: controller.signal,
      });
      onGranted?.(result);
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
      title="Grant garage pass"
      description="Grant a garage pass for a partner org. Confirms after the server accepts."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="grant-garage-pass-form"
            size="sm"
            loading={grantPassMutation.isPending}
            disabled={grantPassMutation.isPending}
          >
            Grant pass
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={grantPassMutation.isPending}
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
        id="grant-garage-pass-form"
        className="admin-form-stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlInput
          label="Organization id"
          mono
          autoComplete="off"
          data-testid="garage-grant-org-id"
          {...form.register('orgId')}
          errorText={form.formState.errors.orgId?.message}
          helperText="Partner org id receiving the pass entitlement."
        />

        <label className="garage-entitlement-kind">
          Pass kind
          <select data-testid="garage-grant-kind" {...form.register('kind')}>
            <option value="DAY">DAY</option>
            <option value="MONTH">MONTH</option>
          </select>
        </label>

        <AlInput
          label="Idempotency key (optional UUID)"
          mono
          autoComplete="off"
          {...form.register('idempotencyKey')}
          errorText={form.formState.errors.idempotencyKey?.message}
        />

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export type AdjustFreeBidsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjusted?: (result: GarageFreeBidsBalanceDto) => void;
};

export function AdjustFreeBidsSheet({ open, onOpenChange, onAdjusted }: AdjustFreeBidsSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { adjustFreeBidsMutation, mapMutationError } = useGarageEntitlementMutations();

  const form = useForm<AdjustGarageFreeBidsFormValues>({
    resolver: zodResolver(adjustGarageFreeBidsSchema),
    defaultValues: {
      orgId: '',
      delta: '1',
      note: '',
      raiseLifetime: false,
      idempotencyKey: '',
    },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({
        orgId: '',
        delta: '1',
        note: '',
        raiseLifetime: false,
        idempotencyKey: '',
      });
    }
  }, [form, open]);

  const submitError = adjustFreeBidsMutation.isError
    ? mapMutationError(adjustFreeBidsMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await adjustFreeBidsMutation.mutateAsync({
        orgId: values.orgId,
        body: toAdjustFreeBidsBody(values),
        signal: controller.signal,
      });
      onAdjusted?.(result);
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
      title="Adjust free bids"
      description="Adjust free bids for a partner org. Balance updates after the server confirms."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="adjust-garage-free-bids-form"
            size="sm"
            loading={adjustFreeBidsMutation.isPending}
            disabled={adjustFreeBidsMutation.isPending}
          >
            Adjust free bids
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={adjustFreeBidsMutation.isPending}
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
        id="adjust-garage-free-bids-form"
        className="admin-form-stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlInput
          label="Organization id"
          mono
          autoComplete="off"
          data-testid="garage-adjust-org-id"
          {...form.register('orgId')}
          errorText={form.formState.errors.orgId?.message}
        />

        <AlInput
          label="Delta (signed)"
          type="number"
          data-testid="garage-adjust-delta"
          {...form.register('delta')}
          errorText={form.formState.errors.delta?.message}
          helperText="Non-zero integer. Positive adds remaining free bids."
        />

        <AlInput
          label="Note (optional)"
          autoComplete="off"
          {...form.register('note')}
          errorText={form.formState.errors.note?.message}
        />

        <Controller
          name="raiseLifetime"
          control={form.control}
          render={({ field }) => (
            <label className="garage-entitlement-checkbox">
              <input
                type="checkbox"
                data-testid="garage-adjust-raise-lifetime"
                checked={Boolean(field.value)}
                onChange={(event) => {
                  field.onChange(event.target.checked);
                }}
              />
              Raise lifetime granted when remaining would exceed it
            </label>
          )}
        />

        <AlInput
          label="Idempotency key (optional UUID)"
          mono
          autoComplete="off"
          {...form.register('idempotencyKey')}
          errorText={form.formState.errors.idempotencyKey?.message}
        />

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function PassGrantResultPanel({ result }: { result: GaragePassGrantResultDto }) {
  return (
    <AdminMutationResultPanel
      title="Pass granted"
      fields={[
        { label: 'Org', value: result.orgId },
        { label: 'Kind', value: result.kind },
        { label: 'Starts', value: result.startsAt },
        { label: 'Ends', value: result.endsAt },
        { label: 'Amount ₹', value: String(result.amountRupees) },
        { label: 'Purchase id', value: result.purchaseId },
      ]}
    />
  );
}

export function FreeBidsBalancePanel({ result }: { result: GarageFreeBidsBalanceDto }) {
  return (
    <AdminMutationResultPanel
      title="Free bids balance"
      fields={[
        { label: 'Org', value: result.orgId },
        { label: 'Remaining', value: String(result.remaining) },
        { label: 'Lifetime granted', value: String(result.lifetimeGranted) },
      ]}
    />
  );
}

export type ProvisionGarageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProvisioned?: (result: ProvisionGarageResultDto) => void;
};

export function ProvisionGarageSheet({
  open,
  onOpenChange,
  onProvisioned,
}: ProvisionGarageSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { provisionGarageMutation, mapMutationError } = useGarageEntitlementMutations();

  const form = useForm<ProvisionGarageFormValues>({
    resolver: zodResolver(provisionGarageSchema),
    defaultValues: {
      accountId: '',
      orgName: '',
      ownerName: '',
      storeName: '',
      storePhone: '',
    },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({
        accountId: '',
        orgName: '',
        ownerName: '',
        storeName: '',
        storePhone: '',
      });
    }
  }, [form, open]);

  const submitError = provisionGarageMutation.isError
    ? mapMutationError(provisionGarageMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await provisionGarageMutation.mutateAsync({
        body: toProvisionGarageBody(values),
        signal: controller.signal,
      });
      onProvisioned?.(result);
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
      title="Provision garage partner"
      description="Provision a Garage partner org. Confirms after the server accepts."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="provision-garage-form"
            size="sm"
            loading={provisionGarageMutation.isPending}
            disabled={provisionGarageMutation.isPending}
          >
            Provision
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={provisionGarageMutation.isPending}
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
        id="provision-garage-form"
        className="admin-form-stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlInput
          label="Account id (UUID)"
          mono
          autoComplete="off"
          data-testid="garage-provision-account-id"
          {...form.register('accountId')}
          errorText={form.formState.errors.accountId?.message}
          helperText="Existing GoTrue account receiving GARAGE_PARTNER enrollment."
        />
        <AlInput
          label="Organization name"
          autoComplete="off"
          data-testid="garage-provision-org-name"
          {...form.register('orgName')}
          errorText={form.formState.errors.orgName?.message}
        />
        <AlInput
          label="Owner name"
          autoComplete="off"
          data-testid="garage-provision-owner-name"
          {...form.register('ownerName')}
          errorText={form.formState.errors.ownerName?.message}
        />
        <AlInput
          label="Store name (optional)"
          autoComplete="off"
          {...form.register('storeName')}
          errorText={form.formState.errors.storeName?.message}
        />
        <AlInput
          label="Store phone (optional)"
          mono
          autoComplete="off"
          {...form.register('storePhone')}
          errorText={form.formState.errors.storePhone?.message}
        />
        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function ProvisionGarageResultPanel({ result }: { result: ProvisionGarageResultDto }) {
  return (
    <AdminMutationResultPanel
      title="Garage provisioned"
      fields={[
        { label: 'Org', value: result.orgId },
        { label: 'Staff', value: result.staffId },
        { label: 'Store', value: result.storeId },
        { label: 'KYC record', value: result.kycRecordId },
        { label: 'Store status', value: result.storeStatus },
        { label: 'Free bids remaining', value: String(result.freeBidsRemaining) },
        { label: 'Converged', value: result.converged ? 'yes' : 'no' },
      ]}
    />
  );
}
