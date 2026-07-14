import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPromoDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlModal } from '@autolokate/ui';
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
      description="Configure a new promotional campaign."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-promo-form"
            size="sm"
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
        className="admin-form-stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <AlInput
                label="Promo code"
                mono
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="Unique code customers enter at checkout."
                autoComplete="off"
              />
            )}
          />

          <div className="promo-form-grid">
            <Controller
              control={form.control}
              name="discountPercent"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Discount percent"
                  type="number"
                  min={1}
                  max={100}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="1–100. Flat rupee amount takes precedence when both are set."
                />
              )}
            />

            <Controller
              control={form.control}
              name="discountRupees"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Discount (₹)"
                  inputMode="decimal"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="Flat discount in rupees. Up to 2 decimals."
                  autoComplete="off"
                />
              )}
            />
          </div>

          <div className="promo-form-grid">
            <Controller
              control={form.control}
              name="validFrom"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Valid from"
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="validTo"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Valid to"
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="promo-form-grid">
            <Controller
              control={form.control}
              name="maxRedemptions"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Max redemptions"
                  type="number"
                  min={1}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="Global cap. Leave empty for unlimited."
                />
              )}
            />

            <Controller
              control={form.control}
              name="maxPerAccount"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Max per account"
                  type="number"
                  min={1}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="Per-account cap. Leave empty for unlimited."
                />
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="active"
            render={({ field }) => (
              <AlCheckbox
                label="Active on creation"
                checked={field.value}
                onChange={(event) => {
                  field.onChange(event.target.checked);
                }}
              />
            )}
          />

          {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}
