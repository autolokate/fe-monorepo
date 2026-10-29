import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPlanDto, ApiPlanTier } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { toCreatePlanBody } from '@/features/catalog/catalog-form-mapper';
import {
  createPlanVersionSchema,
  type CreatePlanVersionFormValues,
} from '@/features/catalog/catalog-schemas';
import { useCatalogMutations } from '@/hooks/catalog/useCatalogMutations';
import { useAdminFormSubmit } from '@/platform/forms/use-admin-form-submit';
import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';
import { formatPlanRef, PLAN_TIERS, planTierLabel } from '@/services/catalog/catalog-model';

export type CreatePlanVersionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: readonly AdminPlanDto[];
  /** Prefill the tier when minting a replacement for a specific version. */
  initialTier?: ApiPlanTier;
  onCreated?: (plan: AdminPlanDto) => void;
};

const TIER_OPTIONS = PLAN_TIERS.map((tier) => ({ value: tier, label: planTierLabel(tier) }));

const DEFAULT_VALUES: CreatePlanVersionFormValues = {
  tier: 'SECURE',
  name: '',
  priceRupees: '',
  riderEligible: false,
  effectiveFrom: '',
  retireCurrent: true,
};

export function CreatePlanVersionSheet({
  open,
  onOpenChange,
  plans,
  initialTier,
  onCreated,
}: CreatePlanVersionSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { createPlanVersionMutation, resolveSubmitError } = useCatalogMutations();

  const form = useForm<CreatePlanVersionFormValues>({
    resolver: zodResolver(createPlanVersionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const tier = useWatch({ control: form.control, name: 'tier' });

  useEffect(() => {
    if (open) {
      form.reset({ ...DEFAULT_VALUES, ...(initialTier ? { tier: initialTier } : {}) });
      return;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    form.reset(DEFAULT_VALUES);
  }, [form, initialTier, open]);

  /** The version this one supersedes — its price is what the admin is actually changing. */
  const outgoing = useMemo(
    () => plans.find((plan) => plan.tier === tier && plan.isEffectiveNow) ?? null,
    [plans, tier],
  );

  const nextVersion = useMemo(() => {
    const versions = plans.filter((plan) => plan.tier === tier).map((plan) => plan.version);
    return versions.length === 0 ? 1 : Math.max(...versions) + 1;
  }, [plans, tier]);

  const submitError = createPlanVersionMutation.isError
    ? resolveSubmitError(createPlanVersionMutation.error)
    : null;

  const { onSubmit, handleFormKeyDown } = useAdminFormSubmit({
    form,
    isPending: createPlanVersionMutation.isPending,
    onValid: async (values) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const plan = await createPlanVersionMutation.mutateAsync({
          body: toCreatePlanBody(values),
          signal: controller.signal,
        });
        onOpenChange(false);
        onCreated?.(plan);
      } catch {
        // Surfaced via mutation state (server message) + toast.
      }
    },
  });

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title="New plan version"
      description="Create a new priced version of a plan. Existing customers stay on the version they bought."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-plan-version-form"
            size="sm"
            loading={createPlanVersionMutation.isPending}
            disabled={createPlanVersionMutation.isPending}
          >
            Create version
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={createPlanVersionMutation.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </div>
      }
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- form-level Enter-to-submit handler; the submit button lives in the sheet footer and is associated via the form attribute, so this keyboard handler is legitimate form interaction */}
      <form
        id="create-plan-version-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        onKeyDown={handleFormKeyDown}
      >
        <AlStack gap="md">
          <p className="admin-empty-note">
            Creating {planTierLabel(tier)} v{String(nextVersion)} keeps current subscribers on their
            existing price and carries feature bullets forward.
          </p>

          <div className="admin-form-grid">
            <Controller
              control={form.control}
              name="tier"
              render={({ field, fieldState }) => (
                <label className="admin-field">
                  Tier
                  <select
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  >
                    {TIER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldState.error?.message ? (
                    <span className="admin-form-error">{fieldState.error.message}</span>
                  ) : (
                    <span className="admin-field__hint">
                      {outgoing
                        ? `Currently live: ${formatPlanRef(outgoing)} at ${formatPaiseAsRupees(outgoing.pricePaise)}.`
                        : 'No live version on this tier yet.'}
                    </span>
                  )}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <label className="admin-field">
                  Name
                  <input
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
                    <span className="admin-field__hint">Shown on the plan card.</span>
                  )}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="priceRupees"
              render={({ field, fieldState }) => (
                <label className="admin-field">
                  Price (₹)
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
                    <span className="admin-field__hint">Up to 2 decimal places.</span>
                  )}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="effectiveFrom"
              render={({ field, fieldState }) => (
                <label className="admin-field">
                  Effective from
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
                  ) : (
                    <span className="admin-field__hint">Leave empty to publish immediately.</span>
                  )}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="riderEligible"
              render={({ field }) => (
                <div className="admin-form-span">
                  <AlCheckbox
                    label="Rider eligible"
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                    }}
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="retireCurrent"
              render={({ field }) => (
                <div className="admin-form-span">
                  <AlCheckbox
                    label="Retire the currently live version"
                    helperText={
                      outgoing
                        ? `Ends ${formatPlanRef(outgoing)} when this version goes live. Existing customers keep their price.`
                        : 'Nothing to retire on this tier yet.'
                    }
                    checked={field.value}
                    disabled={!outgoing}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                    }}
                  />
                </div>
              )}
            />
          </div>

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}
        </AlStack>
      </form>
    </AlModal>
  );
}
