import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPromoDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlModal } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  createPromoSchema,
  defaultPromoValidity,
  type CreatePromoFormValues,
} from '@/features/promos/create-promo-schema';
import { usePromoMutations } from '@/hooks/promos/usePromoMutations';
import { toCreatePromoBody } from '@/features/promos/promo-form-mapper';

import './promos.css';

export type CreatePromoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (promo: AdminPromoDto) => void;
};

const defaultValidity = defaultPromoValidity();

export function CreatePromoSheet({ open, onOpenChange, onCreated }: CreatePromoSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { createPromoMutation, mapMutationError } = usePromoMutations();

  const form = useForm<CreatePromoFormValues>({
    resolver: zodResolver(createPromoSchema),
    defaultValues: {
      code: '',
      discountPercent: undefined,
      discountRupees: '',
      validFrom: defaultValidity.validFrom,
      validTo: defaultValidity.validTo,
      maxRedemptions: undefined,
      maxPerAccount: undefined,
      active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({
        code: '',
        discountPercent: undefined,
        discountRupees: '',
        validFrom: defaultValidity.validFrom,
        validTo: defaultValidity.validTo,
        maxRedemptions: undefined,
        maxPerAccount: undefined,
        active: true,
      });
    }
  }, [form, open]);

  const submitError = createPromoMutation.isError
    ? mapMutationError(createPromoMutation.error).userMessage
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const body = toCreatePromoBody(values);

    try {
      const promo = await createPromoMutation.mutateAsync({
        body,
        signal: controller.signal,
      });
      onOpenChange(false);
      onCreated?.(promo);
    } catch {
      // Error surfaced via mutation state + toast.
    }
  });

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title="Create promo"
      description="Set the code, discount, and limits customers see at checkout."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-promo-form"
            size="sm"
            data-testid="promo-create-submit"
            loading={createPromoMutation.isPending}
            disabled={createPromoMutation.isPending}
          >
            Create promo
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={createPromoMutation.isPending}
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
        id="create-promo-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <div className="admin-form-grid">
          <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <label className="admin-field admin-form-span">
                Promo code
                <input
                  data-testid="promo-create-code"
                  autoComplete="off"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : (
                  <span className="admin-field__hint">
                    Unique code customers enter at checkout.
                  </span>
                )}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="discountPercent"
            render={({ field, fieldState }) => (
              <label className="admin-field">
                Discount percent
                <input
                  type="number"
                  min={1}
                  max={100}
                  data-testid="promo-create-discount-percent"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : (
                  <span className="admin-field__hint">
                    1–100. Flat rupee amount wins when both are set.
                  </span>
                )}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="discountRupees"
            render={({ field, fieldState }) => (
              <label className="admin-field">
                Discount (₹)
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : (
                  <span className="admin-field__hint">
                    Flat discount in rupees. Up to 2 decimals.
                  </span>
                )}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="validFrom"
            render={({ field, fieldState }) => (
              <label className="admin-field">
                Valid from
                <input
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : null}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="validTo"
            render={({ field, fieldState }) => (
              <label className="admin-field">
                Valid to
                <input
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : null}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="maxRedemptions"
            render={({ field, fieldState }) => (
              <label className="admin-field">
                Max redemptions
                <input
                  type="number"
                  min={1}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : (
                  <span className="admin-field__hint">Global cap. Leave empty for unlimited.</span>
                )}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="maxPerAccount"
            render={({ field, fieldState }) => (
              <label className="admin-field">
                Max per account
                <input
                  type="number"
                  min={1}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.error?.message ? (
                  <span className="admin-form-error">{fieldState.error.message}</span>
                ) : (
                  <span className="admin-field__hint">
                    Per-account cap. Leave empty for unlimited.
                  </span>
                )}
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="active"
            render={({ field }) => (
              <div className="admin-form-span">
                <AlCheckbox
                  label="Active on creation"
                  checked={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.checked);
                  }}
                />
              </div>
            )}
          />
        </div>

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}
