import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPlanDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { toUpdatePlanFeaturesBody } from '@/features/catalog/catalog-form-mapper';
import {
  planFeaturesSchema,
  type PlanFeaturesFormValues,
} from '@/features/catalog/catalog-schemas';
import { catalogQueryKeys } from '@/hooks/catalog/catalog-query-keys';
import { useCatalogMutations } from '@/hooks/catalog/useCatalogMutations';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { useAdminFormSubmit } from '@/platform/forms/use-admin-form-submit';
import { fetchPlanFeatures } from '@/services/catalog/admin-catalog-service';
import { formatPlanRef } from '@/services/catalog/catalog-model';

export type EditPlanFeaturesSheetProps = {
  plan: AdminPlanDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY_VALUES: PlanFeaturesFormValues = {
  features: [{ value: '' }],
  badge: '',
  includesLabel: '',
};

/**
 * Features belong to a plan VERSION, not a tier — so this edits the card copy of exactly the version you
 * opened, and it is editable in place (unlike the price).
 */
export function EditPlanFeaturesSheet({ plan, open, onOpenChange }: EditPlanFeaturesSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { updatePlanFeaturesMutation, resolveSubmitError } = useCatalogMutations();

  const featuresQuery = useQuery({
    queryKey: catalogQueryKeys.planFeatures(plan?.id ?? 'none'),
    queryFn: ({ signal }) => fetchPlanFeatures(plan?.id ?? '', signal),
    enabled: open && plan !== null,
    meta: { errorMessage: 'Unable to load plan features.' },
  });

  const form = useForm<PlanFeaturesFormValues>({
    resolver: zodResolver(planFeaturesSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'features' });

  const loaded = featuresQuery.data;

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset(EMPTY_VALUES);
      return;
    }
    if (!loaded) {
      return;
    }
    form.reset({
      features:
        loaded.features.length > 0 ? loaded.features.map((value) => ({ value })) : [{ value: '' }],
      badge: loaded.badge ?? '',
      includesLabel: loaded.includesLabel ?? '',
    });
  }, [form, loaded, open]);

  const submitError = updatePlanFeaturesMutation.isError
    ? resolveSubmitError(updatePlanFeaturesMutation.error)
    : null;

  const loadError = featuresQuery.isError
    ? mapAdminApiError(featuresQuery.error).userMessage
    : null;

  const { onSubmit, handleFormKeyDown } = useAdminFormSubmit({
    form,
    isPending: updatePlanFeaturesMutation.isPending,
    onValid: async (values) => {
      if (!plan) {
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await updatePlanFeaturesMutation.mutateAsync({
          planId: plan.id,
          body: toUpdatePlanFeaturesBody(values),
          signal: controller.signal,
        });
        onOpenChange(false);
      } catch {
        // Surfaced via mutation state (server message) + toast.
      }
    },
  });

  if (!plan) {
    return null;
  }

  const featuresError = form.formState.errors.features?.root?.message;
  const isBusy = updatePlanFeaturesMutation.isPending;

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={`Features — ${formatPlanRef(plan)}`}
      description={`Card copy for ${plan.name}. Features belong to this version; editing them does not reprice anyone.`}
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="edit-plan-features-form"
            size="sm"
            loading={isBusy}
            disabled={isBusy || featuresQuery.isLoading}
          >
            Save features
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={isBusy}
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
        id="edit-plan-features-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        onKeyDown={handleFormKeyDown}
      >
        <AlStack gap="lg">
          {loadError ? <AlText role="alert">{loadError}</AlText> : null}
          {featuresQuery.isLoading ? <AlText tone="muted">Loading features…</AlText> : null}

          <AlStack gap="sm">
            <AlText variant="label">Feature bullets</AlText>
            <AlText variant="caption" tone="muted">
              At least one is required — an empty list renders a blank plan card in the app.
            </AlText>

            {fields.map((field, index) => (
              <div key={field.id} className="catalog-feature-row">
                <Controller
                  control={form.control}
                  // String(index) keeps the template lint-clean; the cast restores the exact path type.
                  name={`features.${String(index)}.value` as `features.${number}.value`}
                  render={({ field: inputField, fieldState }) => (
                    <AlInput
                      label={`Bullet ${String(index + 1)}`}
                      value={inputField.value}
                      onChange={inputField.onChange}
                      onBlur={inputField.onBlur}
                      errorText={fieldState.error?.message}
                      autoComplete="off"
                    />
                  )}
                />
                <AlButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isBusy || fields.length === 1}
                  onClick={() => {
                    remove(index);
                  }}
                >
                  Remove
                </AlButton>
              </div>
            ))}

            {featuresError ? <AlText role="alert">{featuresError}</AlText> : null}

            <div>
              <AlButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy}
                onClick={() => {
                  append({ value: '' });
                }}
              >
                Add bullet
              </AlButton>
            </div>
          </AlStack>

          <Controller
            control={form.control}
            name="badge"
            render={({ field, fieldState }) => (
              <AlInput
                label="Badge"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="Optional ribbon on the card — e.g. Most popular. Leave empty for none."
                autoComplete="off"
              />
            )}
          />

          <Controller
            control={form.control}
            name="includesLabel"
            render={({ field, fieldState }) => (
              <AlInput
                label="Includes label"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="Optional heading above the bullets — e.g. Everything in SECURE, plus."
                autoComplete="off"
              />
            )}
          />

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}
        </AlStack>
      </form>
    </AlModal>
  );
}
