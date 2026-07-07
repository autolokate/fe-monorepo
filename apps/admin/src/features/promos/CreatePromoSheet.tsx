import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPromoDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlSheet, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  createPromoSchema,
  defaultPromoValidity,
  type CreatePromoFormValues,
} from '@/features/promos/create-promo-schema.js';
import { usePromoMutations } from '@/hooks/promos/usePromoMutations.js';
import { toCreatePromoBody } from '@/features/promos/promo-form-mapper.js';

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
      discountPaise: undefined,
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
        discountPaise: undefined,
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
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create promo"
      description="Configure a new promotional campaign."
    >
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <AlStack gap="lg">
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
                  helperText="1–100. Flat paise takes precedence when both are set."
                />
              )}
            />

            <Controller
              control={form.control}
              name="discountPaise"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Discount paise"
                  type="number"
                  min={1}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next === '' ? undefined : event.target.valueAsNumber);
                  }}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="Flat discount in paise (100 paise = ₹1)."
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

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}

          <AlStack gap="sm" direction="row">
            <AlButton
              type="submit"
              loading={createPromoMutation.isPending}
              disabled={createPromoMutation.isPending}
            >
              Create promo
            </AlButton>
            <AlButton
              type="button"
              variant="secondary"
              disabled={createPromoMutation.isPending}
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
