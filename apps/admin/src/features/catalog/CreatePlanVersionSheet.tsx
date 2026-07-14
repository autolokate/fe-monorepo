import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPlanDto, ApiPlanTier } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlSelect, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useMemo, useRef, type ChangeEvent } from 'react';
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
      description="Plans are immutable. Changing a price or a name mints a new version — this is the only way to do it."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-plan-version-form"
            size="sm"
            loading={createPlanVersionMutation.isPending}
            disabled={createPlanVersionMutation.isPending}
          >
            Mint version
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
      <form
        id="create-plan-version-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        onKeyDown={handleFormKeyDown}
      >
        <AlStack gap="md">
          <AlText variant="caption" tone="muted">
            A live Subscription pins the plan version it was sold on, so an existing version can never be
            repriced — customers who already paid would be retro-repriced. Minting {planTierLabel(tier)} v
            {String(nextVersion)} leaves every current subscriber on their own version, and copies the
            outgoing version&apos;s feature bullets forward.
          </AlText>

          <Controller
            control={form.control}
            name="tier"
            render={({ field, fieldState }) => (
              <AlSelect
                label="Tier"
                options={TIER_OPTIONS}
                value={field.value}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  field.onChange(event.target.value);
                }}
                errorText={fieldState.error?.message}
                helperText={
                  outgoing
                    ? `Currently live: ${formatPlanRef(outgoing)} at ${formatPaiseAsRupees(outgoing.pricePaise)}.`
                    : 'No live version on this tier yet.'
                }
              />
            )}
          />

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <AlInput
                label="Name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="Shown on the plan card."
                autoComplete="off"
              />
            )}
          />

          <Controller
            control={form.control}
            name="priceRupees"
            render={({ field, fieldState }) => (
              <AlInput
                label="Price (₹)"
                inputMode="decimal"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="Up to 2 decimal places."
                autoComplete="off"
              />
            )}
          />

          <Controller
            control={form.control}
            name="effectiveFrom"
            render={({ field, fieldState }) => (
              <AlInput
                label="Effective from"
                type="datetime-local"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="Leave empty to let the server publish it immediately."
              />
            )}
          />

          <Controller
            control={form.control}
            name="riderEligible"
            render={({ field }) => (
              <AlCheckbox
                label="Rider eligible"
                checked={field.value}
                onChange={(event) => {
                  field.onChange(event.target.checked);
                }}
              />
            )}
          />

          <Controller
            control={form.control}
            name="retireCurrent"
            render={({ field }) => (
              <AlCheckbox
                label="Retire the currently live version"
                helperText={
                  outgoing
                    ? `Stamps ${formatPlanRef(outgoing)} with an end date in the same transaction. Existing subscribers keep their pinned version and price.`
                    : 'Nothing to retire on this tier yet.'
                }
                checked={field.value}
                disabled={!outgoing}
                onChange={(event) => {
                  field.onChange(event.target.checked);
                }}
              />
            )}
          />

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}
        </AlStack>
      </form>
    </AlModal>
  );
}
