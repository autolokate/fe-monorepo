import { zodResolver } from '@hookform/resolvers/zod';
import type {
  GarageFreeBidsBalanceDto,
  GaragePassGrantResultDto,
  ProvisionGarageResultDto,
} from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
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
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import {
  AdminKpiStrip,
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
} from '@/platform/components/AdminWowSurface';

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
      description="Give a partner org a day or month garage pass."
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
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-field admin-form-span">
            Organization
            <input
              data-testid="garage-grant-org-id"
              autoComplete="off"
              {...form.register('orgId')}
            />
            <span className="admin-field__hint">Partner organization receiving the pass.</span>
            {form.formState.errors.orgId?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.orgId.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Pass length
            <select data-testid="garage-grant-kind" {...form.register('kind')}>
              <option value="DAY">Day</option>
              <option value="MONTH">Month</option>
            </select>
          </label>

          <label className="admin-field">
            Optional request key
            <input autoComplete="off" {...form.register('idempotencyKey')} />
            <span className="admin-field__hint">
              Reuse the same key to safely retry without double-granting.
            </span>
            {form.formState.errors.idempotencyKey?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.idempotencyKey.message}
              </span>
            ) : null}
          </label>
        </div>

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
      description="Add or remove free bids for a partner org."
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
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-field admin-form-span">
            Organization
            <input
              data-testid="garage-adjust-org-id"
              autoComplete="off"
              {...form.register('orgId')}
            />
            {form.formState.errors.orgId?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.orgId.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Change amount
            <input type="number" data-testid="garage-adjust-delta" {...form.register('delta')} />
            <span className="admin-field__hint">
              Non-zero whole number. Positive adds remaining free bids.
            </span>
            {form.formState.errors.delta?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.delta.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Note (optional)
            <input autoComplete="off" {...form.register('note')} />
            {form.formState.errors.note?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.note.message}
              </span>
            ) : null}
          </label>

          <div className="admin-field admin-form-span garage-entitlement-checkbox">
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
          </div>

          <label className="admin-field admin-form-span">
            Optional request key
            <input autoComplete="off" {...form.register('idempotencyKey')} />
            <span className="admin-field__hint">
              Reuse the same key to safely retry without double-adjusting.
            </span>
            {form.formState.errors.idempotencyKey?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.idempotencyKey.message}
              </span>
            ) : null}
          </label>
        </div>

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function PassGrantResultPanel({ result }: { result: GaragePassGrantResultDto }) {
  return (
    <AdminPanel title="Pass granted" subtitle="Garage pass entitlement for this partner.">
      <div className="admin-status-row">
        <AdminStatusChip label={humanizeAdminLabel(result.kind)} tone="active" />
      </div>
      <AdminKpiStrip items={[{ label: 'Amount ₹', value: String(result.amountRupees) }]} />
      <AdminDetailGrid>
        <AdminDetailField label="Organization" value={result.orgId} mono />
        <AdminDetailField label="Starts" value={result.startsAt} />
        <AdminDetailField label="Ends" value={result.endsAt} />
        <AdminDetailField label="Purchase" value={result.purchaseId} mono />
      </AdminDetailGrid>
    </AdminPanel>
  );
}

export function FreeBidsBalancePanel({ result }: { result: GarageFreeBidsBalanceDto }) {
  return (
    <AdminPanel title="Free bids balance" subtitle="Updated free-bid counts for this partner.">
      <AdminKpiStrip
        items={[
          { label: 'Remaining', value: String(result.remaining) },
          { label: 'Lifetime granted', value: String(result.lifetimeGranted) },
        ]}
      />
      <AdminDetailGrid>
        <AdminDetailField label="Organization" value={result.orgId} mono />
      </AdminDetailGrid>
    </AdminPanel>
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
      description="Create a Garage partner organization for an existing customer account."
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
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-field admin-form-span">
            Account receiving Garage partner access
            <input
              data-testid="garage-provision-account-id"
              autoComplete="off"
              placeholder="Customer account receiving Garage access"
              {...form.register('accountId')}
            />
            <span className="admin-field__hint">
              Existing customer account that will own the Garage partner org.
            </span>
            {form.formState.errors.accountId?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.accountId.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Organization name
            <input
              data-testid="garage-provision-org-name"
              autoComplete="off"
              {...form.register('orgName')}
            />
            {form.formState.errors.orgName?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.orgName.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Owner name
            <input
              data-testid="garage-provision-owner-name"
              autoComplete="off"
              {...form.register('ownerName')}
            />
            {form.formState.errors.ownerName?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.ownerName.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Store name (optional)
            <input autoComplete="off" {...form.register('storeName')} />
            {form.formState.errors.storeName?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.storeName.message}
              </span>
            ) : null}
          </label>

          <label className="admin-field">
            Store phone (optional)
            <input autoComplete="off" {...form.register('storePhone')} />
            {form.formState.errors.storePhone?.message ? (
              <span className="admin-form-error" role="alert">
                {form.formState.errors.storePhone.message}
              </span>
            ) : null}
          </label>
        </div>
        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}

export function ProvisionGarageResultPanel({ result }: { result: ProvisionGarageResultDto }) {
  return (
    <AdminPanel title="Garage provisioned" subtitle="Organization and storefront are ready.">
      <div className="admin-status-row">
        <AdminStatusChip
          label={humanizeAdminLabel(result.storeStatus)}
          tone={result.converged ? 'active' : 'draft'}
        />
      </div>
      <AdminKpiStrip
        items={[{ label: 'Free bids remaining', value: String(result.freeBidsRemaining) }]}
      />
      <AdminDetailGrid>
        <AdminDetailField label="Organization" value={result.orgId} mono />
        <AdminDetailField label="Staff" value={result.staffId} mono />
        <AdminDetailField label="Store" value={result.storeId} mono />
        <AdminDetailField label="KYC record" value={result.kycRecordId} mono />
      </AdminDetailGrid>
    </AdminPanel>
  );
}
