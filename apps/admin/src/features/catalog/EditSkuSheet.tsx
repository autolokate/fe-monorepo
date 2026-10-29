import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPlanDto, SkuSummaryDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { toUpdateSkuBody } from '@/features/catalog/catalog-form-mapper';
import { makeUpdateSkuSchema, type UpdateSkuFormValues } from '@/features/catalog/catalog-schemas';
import { ShelfTierPicker } from '@/features/catalog/ShelfTierPicker';
import { useCatalogMutations } from '@/hooks/catalog/useCatalogMutations';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { useAdminFormSubmit } from '@/platform/forms/use-admin-form-submit';
import { paiseToRupeeInput } from '@/services/catalog/catalog-money';
import {
  formatPlanOptionLabel,
  getEffectivePlans,
  getTiersWithEffectivePlan,
} from '@/services/catalog/catalog-model';

export type EditSkuSheetProps = {
  sku: SkuSummaryDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: readonly AdminPlanDto[];
  canWrite: boolean;
};

export function EditSkuSheet({ sku, open, onOpenChange, plans, canWrite }: EditSkuSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { updateSkuMutation, resolveSubmitError } = useCatalogMutations();

  const effectivePlans = useMemo(() => getEffectivePlans(plans), [plans]);
  const selectableTiers = useMemo(() => getTiersWithEffectivePlan(plans), [plans]);
  const tierByPlanId = useMemo(() => new Map(plans.map((plan) => [plan.id, plan.tier])), [plans]);

  const schema = useMemo(() => makeUpdateSkuSchema(tierByPlanId), [tierByPlanId]);

  const form = useForm<UpdateSkuFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      offeredTiers: [],
      defaultPlanId: '',
      listPriceRupees: '',
      riderDefault: 0,
      active: true,
    },
  });

  const offeredTiers = useWatch({ control: form.control, name: 'offeredTiers' });
  const defaultPlanId = useWatch({ control: form.control, name: 'defaultPlanId' });

  const defaultPlanOptions = useMemo(() => {
    const options = effectivePlans
      .filter((plan) => offeredTiers.includes(plan.tier))
      .map((plan) => ({ value: plan.id, label: formatPlanOptionLabel(plan) }));

    // A SKU may already point at a plan that has since been retired — keep it visible rather than
    // silently blanking the field, so the admin sees what they are replacing.
    if (sku?.defaultPlanId && !options.some((option) => option.value === sku.defaultPlanId)) {
      const current = plans.find((plan) => plan.id === sku.defaultPlanId);
      if (current) {
        options.unshift({
          value: current.id,
          label: `${formatPlanOptionLabel(current)} (current — not live)`,
        });
      }
    }
    return options;
  }, [effectivePlans, offeredTiers, plans, sku?.defaultPlanId]);

  useEffect(() => {
    if (!open || !sku) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }
    form.reset({
      offeredTiers: [...sku.offeredTiers],
      defaultPlanId: sku.defaultPlanId ?? '',
      listPriceRupees: paiseToRupeeInput(sku.listPricePaise),
      riderDefault: sku.riderDefault,
      active: sku.active,
    });
  }, [form, open, sku]);

  // Taking a tier off the shelf must take its plan off the default slot with it.
  useEffect(() => {
    if (defaultPlanId === '') {
      return;
    }
    const tier = tierByPlanId.get(defaultPlanId);
    if (tier && !offeredTiers.includes(tier)) {
      form.setValue('defaultPlanId', '');
    }
  }, [defaultPlanId, form, offeredTiers, tierByPlanId]);

  const submitError = updateSkuMutation.isError
    ? resolveSubmitError(updateSkuMutation.error)
    : null;

  const { onSubmit, handleFormKeyDown } = useAdminFormSubmit({
    form,
    isPending: updateSkuMutation.isPending,
    onValid: async (values) => {
      if (!sku) {
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await updateSkuMutation.mutateAsync({
          skuId: sku.id,
          body: toUpdateSkuBody(values),
          signal: controller.signal,
        });
        onOpenChange(false);
      } catch {
        // Surfaced via mutation state (server message) + toast.
      }
    },
  });

  if (!sku) {
    return null;
  }

  const isBusy = updateSkuMutation.isPending;

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={sku.skuCode}
      description={`${sku.channel} · ${sku.prepaid ? 'Prepaid' : 'Not prepaid'}`}
      footer={
        canWrite ? (
          <div className="admin-modal-actions">
            <AlButton
              type="submit"
              form="edit-sku-form"
              size="sm"
              loading={isBusy}
              disabled={isBusy}
            >
              Save SKU
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
        ) : undefined
      }
    >
      <AlStack gap="md">
        <AdminDetailSection
          title="Locked at create"
          description="Channel and product code stay fixed so printed stock stays consistent."
        >
          <AdminDetailGrid>
            <AdminDetailField label="Product code" value={sku.skuCode} mono />
            <AdminDetailField label="Channel" value={sku.channel} />
            <AdminDetailField label="Prepaid" value={sku.prepaid ? 'Yes' : 'No'} />
          </AdminDetailGrid>
        </AdminDetailSection>

        {canWrite ? (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- form-level Enter-to-submit handler; the submit button lives in the sheet footer and is associated via the form attribute, so this keyboard handler is legitimate form interaction
          <form
            id="edit-sku-form"
            onSubmit={(event) => {
              void onSubmit(event);
            }}
            onKeyDown={handleFormKeyDown}
          >
            <AlStack gap="md">
              <div className="admin-form-grid">
                <div className="admin-form-span">
                  <Controller
                    control={form.control}
                    name="offeredTiers"
                    render={({ field, fieldState }) => (
                      <ShelfTierPicker
                        selectableTiers={selectableTiers}
                        value={field.value}
                        onChange={field.onChange}
                        errorText={fieldState.error?.message}
                        disabled={isBusy}
                      />
                    )}
                  />
                </div>

                <Controller
                  control={form.control}
                  name="defaultPlanId"
                  render={({ field, fieldState }) => (
                    <label className="admin-field">
                      Default plan
                      <select
                        value={field.value}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={isBusy || defaultPlanOptions.length === 0}
                      >
                        <option value="">
                          {offeredTiers.length === 0
                            ? 'Put a tier on the shelf first'
                            : 'Select default plan'}
                        </option>
                        {defaultPlanOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {fieldState.error?.message ? (
                        <span className="admin-form-error">{fieldState.error.message}</span>
                      ) : (
                        <span className="admin-field__hint">
                          Must be a plan whose tier is on this shelf.
                        </span>
                      )}
                    </label>
                  )}
                />

                <Controller
                  control={form.control}
                  name="listPriceRupees"
                  render={({ field, fieldState }) => (
                    <label className="admin-field">
                      List price (₹)
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
                          What the sticker costs. Up to 2 decimal places.
                        </span>
                      )}
                    </label>
                  )}
                />

                <Controller
                  control={form.control}
                  name="riderDefault"
                  render={({ field, fieldState }) => (
                    <label className="admin-field">
                      Rider default
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={field.value}
                        onChange={(event) => {
                          field.onChange(
                            event.target.value === '' ? 0 : event.target.valueAsNumber,
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                      {fieldState.error?.message ? (
                        <span className="admin-form-error">{fieldState.error.message}</span>
                      ) : (
                        <span className="admin-field__hint">
                          Riders bundled with the plan by default.
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
                        label="Accepting new batches"
                        helperText="Turn off to stop new batches. Printed stock can still sell."
                        checked={field.value}
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
        ) : null}
      </AlStack>
    </AlModal>
  );
}
