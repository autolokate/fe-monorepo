import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPlanDto, SkuSummaryDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlSelect, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useMemo, useRef, type ChangeEvent } from 'react';
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
          title="Immutable"
          description="Frozen at create — a batch pins its (channel, sku) when codes are generated."
        >
          <AdminDetailGrid>
            <AdminDetailField label="SKU code" value={sku.skuCode} mono />
            <AdminDetailField label="Channel" value={sku.channel} />
            <AdminDetailField label="Prepaid" value={sku.prepaid ? 'Yes' : 'No'} />
          </AdminDetailGrid>
        </AdminDetailSection>

        {canWrite ? (
          <form
            id="edit-sku-form"
            onSubmit={(event) => {
              void onSubmit(event);
            }}
            onKeyDown={handleFormKeyDown}
          >
            <AlStack gap="md">
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

              <Controller
                control={form.control}
                name="defaultPlanId"
                render={({ field, fieldState }) => (
                  <AlSelect
                    label="Default plan"
                    placeholder={
                      offeredTiers.length === 0
                        ? 'Put a tier on the shelf first'
                        : 'Select default plan'
                    }
                    options={defaultPlanOptions}
                    value={field.value}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                      field.onChange(event.target.value);
                    }}
                    disabled={isBusy || defaultPlanOptions.length === 0}
                    errorText={fieldState.error?.message}
                    helperText="Must be a plan whose tier is on this SKU's own shelf. The server derives the version."
                  />
                )}
              />

              <Controller
                control={form.control}
                name="listPriceRupees"
                render={({ field, fieldState }) => (
                  <AlInput
                    label="List price (₹)"
                    inputMode="decimal"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    errorText={fieldState.error?.message}
                    helperText="What the sticker costs. Up to 2 decimal places."
                    autoComplete="off"
                  />
                )}
              />

              <Controller
                control={form.control}
                name="riderDefault"
                render={({ field, fieldState }) => (
                  <AlInput
                    label="Rider default"
                    type="number"
                    min={0}
                    max={10}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value === '' ? 0 : event.target.valueAsNumber);
                    }}
                    onBlur={field.onBlur}
                    errorText={fieldState.error?.message}
                    helperText="Riders bundled with the plan by default."
                  />
                )}
              />

              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <AlCheckbox
                    label="Accepting new batches"
                    helperText="Controls whether NEW batches may be manufactured against this SKU. Turning it off does NOT stop stock already printed from selling."
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                    }}
                  />
                )}
              />

              {submitError ? <AlText role="alert">{submitError}</AlText> : null}
            </AlStack>
          </form>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
