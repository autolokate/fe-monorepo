import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminPlanDto, SkuSummaryDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlModal, AlStack } from '@autolokate/ui';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { toCreateSkuBody } from '@/features/catalog/catalog-form-mapper';
import { makeCreateSkuSchema, type CreateSkuFormValues } from '@/features/catalog/catalog-schemas';
import { ShelfTierPicker } from '@/features/catalog/ShelfTierPicker';
import { useCatalogMutations } from '@/hooks/catalog/useCatalogMutations';
import { useAdminFormSubmit } from '@/platform/forms/use-admin-form-submit';
import {
  formatPlanOptionLabel,
  getEffectivePlans,
  getTiersWithEffectivePlan,
} from '@/services/catalog/catalog-model';

export type CreateSkuSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: readonly AdminPlanDto[];
  onCreated?: (sku: SkuSummaryDto) => void;
};

const CHANNEL_OPTIONS = [
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'B2B', label: 'B2B' },
];

const DEFAULT_VALUES: CreateSkuFormValues = {
  skuCode: '',
  channel: 'B2C',
  prepaid: false,
  sponsorOrgId: '',
  offeredTiers: [],
  defaultPlanId: '',
  listPriceRupees: '',
  riderDefault: 0,
  active: true,
};

export function CreateSkuSheet({ open, onOpenChange, plans, onCreated }: CreateSkuSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { createSkuMutation, resolveSubmitError } = useCatalogMutations();

  // Only a tier with an effective plan can be priced, so only those may go on a shelf.
  const effectivePlans = useMemo(() => getEffectivePlans(plans), [plans]);
  const selectableTiers = useMemo(() => getTiersWithEffectivePlan(plans), [plans]);
  const tierByPlanId = useMemo(() => new Map(plans.map((plan) => [plan.id, plan.tier])), [plans]);

  const schema = useMemo(() => makeCreateSkuSchema(tierByPlanId), [tierByPlanId]);

  const form = useForm<CreateSkuFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const offeredTiers = useWatch({ control: form.control, name: 'offeredTiers' });
  const defaultPlanId = useWatch({ control: form.control, name: 'defaultPlanId' });

  // The default plan must live on this SKU's own shelf — so the picker only offers plans that do.
  const defaultPlanOptions = useMemo(
    () =>
      effectivePlans
        .filter((plan) => offeredTiers.includes(plan.tier))
        .map((plan) => ({ value: plan.id, label: formatPlanOptionLabel(plan) })),
    [effectivePlans, offeredTiers],
  );

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset(DEFAULT_VALUES);
    }
  }, [form, open]);

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

  const submitError = createSkuMutation.isError
    ? resolveSubmitError(createSkuMutation.error)
    : null;

  const { onSubmit, handleFormKeyDown } = useAdminFormSubmit({
    form,
    isPending: createSkuMutation.isPending,
    onValid: async (values) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const sku = await createSkuMutation.mutateAsync({
          body: toCreateSkuBody(values),
          signal: controller.signal,
        });
        onOpenChange(false);
        onCreated?.(sku);
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
      title="New SKU"
      description="A product shelf lists which plan tiers can sell against its stock."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-sku-form"
            size="sm"
            data-testid="sku-create-submit"
            loading={createSkuMutation.isPending}
            disabled={createSkuMutation.isPending}
          >
            Create SKU
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={createSkuMutation.isPending}
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
        id="create-sku-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        onKeyDown={handleFormKeyDown}
      >
        <AlStack gap="md">
          <div className="admin-form-grid">
            <Controller
              control={form.control}
              name="skuCode"
              render={({ field, fieldState }) => (
                <label className="admin-field">
                  Product code
                  <input
                    data-testid="sku-create-code"
                    autoComplete="off"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value.toUpperCase());
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                  {fieldState.error?.message ? (
                    <span className="admin-form-error">{fieldState.error.message}</span>
                  ) : (
                    <span className="admin-field__hint">
                      Locked after create — e.g. SKU-B2C-SHIELD.
                    </span>
                  )}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="channel"
              render={({ field, fieldState }) => (
                <label className="admin-field">
                  Channel
                  <select
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  >
                    {CHANNEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldState.error?.message ? (
                    <span className="admin-form-error">{fieldState.error.message}</span>
                  ) : (
                    <span className="admin-field__hint">
                      Locked after create — batches keep this channel.
                    </span>
                  )}
                </label>
              )}
            />

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
                    disabled={createSkuMutation.isPending}
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
                    data-testid="sku-create-default-plan"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={defaultPlanOptions.length === 0}
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
                      Only live plans whose tier is on this shelf.
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
                    data-testid="sku-create-list-price"
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
                      field.onChange(event.target.value === '' ? 0 : event.target.valueAsNumber);
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
              name="sponsorOrgId"
              render={({ field, fieldState }) => (
                <label className="admin-field admin-form-span">
                  Sponsor organization
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
                    <span className="admin-field__hint">
                      Optional. Locked after create. Leave empty if unsponsored.
                    </span>
                  )}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="prepaid"
              render={({ field }) => (
                <div className="admin-form-span">
                  <AlCheckbox
                    label="Prepaid"
                    helperText="Stock is paid for up front (fleet). Locked after create."
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

          {submitError ? <p className="admin-form-error">{submitError}</p> : null}
        </AlStack>
      </form>
    </AlModal>
  );
}
