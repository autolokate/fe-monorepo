import { zodResolver } from '@hookform/resolvers/zod';
import type { BatchSummaryDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlSelect, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  CHANNEL_OPTIONS,
  PLAN_TIER_OPTIONS,
  createBatchSchema,
  type CreateBatchFormValues,
} from '@/features/qr-batches/create-batch-schema';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations';
import { useSkus } from '@/hooks/qr-batches/useSkus';
import { useAdminFormSubmit } from '@/platform/forms/use-admin-form-submit';

export type CreateBatchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (batch: BatchSummaryDto) => void;
};

const DEFAULT_VALUES: CreateBatchFormValues = {
  channel: 'B2C',
  skuId: '',
  totalCount: 500,
  planTier: undefined,
};

/** Map B2B plan enum → fixed catalog sku_code. */
function b2bSkuCodeForPlan(planTier: CreateBatchFormValues['planTier']): string | null {
  if (planTier === 'SECURE') return 'SKU-B2B-SECURE';
  if (planTier === 'SHIELD') return 'SKU-B2B-SHIELD';
  if (planTier === 'SHIELD_PLUS') return 'SKU-B2B-SHIELDPLUS';
  return null;
}

export function CreateBatchSheet({ open, onOpenChange, onCreated }: CreateBatchSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { createBatchMutation, mapMutationError } = useQrBatchMutations();

  const form = useForm<CreateBatchFormValues>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const channel = useWatch({ control: form.control, name: 'channel' });
  const planTier = useWatch({ control: form.control, name: 'planTier' });
  const skusQuery = useSkus(channel, open);

  const channelSkus = useMemo(
    () => (skusQuery.data ?? []).filter((sku) => sku.channel === channel),
    [channel, skusQuery.data],
  );

  // B2B: pin SKU to the selected plan; open channels: full channel list.
  const skuOptions = useMemo(() => {
    if (channel !== 'B2B') {
      return channelSkus.map((sku) => ({
        value: sku.id,
        label: sku.skuCode,
      }));
    }
    const wanted = b2bSkuCodeForPlan(planTier);
    return channelSkus
      .filter((sku) => (wanted ? sku.skuCode === wanted : true))
      .map((sku) => ({
        value: sku.id,
        label: sku.skuCode,
      }));
  }, [channel, channelSkus, planTier]);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset(DEFAULT_VALUES);
    }
  }, [form, open]);

  useEffect(() => {
    if (channel !== 'B2B') {
      form.setValue('planTier', undefined);
      form.clearErrors('planTier');
    }
    form.setValue('skuId', '');
    form.clearErrors('skuId');
  }, [channel, form]);

  // B2B: auto-select the plan-pinned SKU when the catalog loads / plan changes.
  useEffect(() => {
    if (channel !== 'B2B') return;
    const wanted = b2bSkuCodeForPlan(planTier);
    if (!wanted) {
      form.setValue('skuId', '');
      return;
    }
    const match = channelSkus.find((sku) => sku.skuCode === wanted);
    form.setValue('skuId', match?.id ?? '');
    if (match) {
      form.clearErrors('skuId');
    }
  }, [channel, channelSkus, form, planTier]);

  const submitError = createBatchMutation.isError
    ? mapMutationError(createBatchMutation.error).userMessage
    : null;

  const pinnedSkuCode = b2bSkuCodeForPlan(planTier);
  const skuHelper = skusQuery.isError
    ? 'Could not load SKUs. Retry by reopening this sheet.'
    : skusQuery.isFetching
      ? `Loading ${channel} SKUs…`
      : channel === 'B2B'
        ? !planTier
          ? 'Select a plan tier — the matching B2B SKU is applied automatically.'
          : skuOptions.length === 0
            ? `No ${pinnedSkuCode ?? 'matching B2B SKU'} in catalog. Run scripts/seed-skus.sql.`
            : 'Pinned to the selected plan tier (ops catalog).'
        : skuOptions.length === 0
          ? `No active ${channel} SKUs. Seed the catalog first.`
          : `Only ${channel} SKUs — changes when you switch channel.`;

  const canSubmit =
    !createBatchMutation.isPending &&
    skuOptions.length > 0 &&
    (channel !== 'B2B' || Boolean(planTier));

  const { onSubmit, handleFormKeyDown } = useAdminFormSubmit({
    form,
    isPending: createBatchMutation.isPending,
    onValid: async (values) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const batch = await createBatchMutation.mutateAsync({
          body: {
            channel: values.channel,
            skuId: values.skuId,
            totalCount: values.totalCount,
            ...(values.channel === 'B2B' && values.planTier ? { planTier: values.planTier } : {}),
          },
          signal: controller.signal,
        });
        onOpenChange(false);
        onCreated?.(batch);
      } catch {
        // Error surfaced via mutation state + toast.
      }
    },
  });

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title="Create batch"
      description="Set up a new QR batch in draft status. The server mints the batch code; sticker codes stay short and opaque."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="create-batch-form"
            size="sm"
            loading={createBatchMutation.isPending}
            disabled={!canSubmit}
          >
            Create batch
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={createBatchMutation.isPending}
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
        id="create-batch-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        onKeyDown={handleFormKeyDown}
      >
        <AlStack gap="md">
          <Controller
            control={form.control}
            name="channel"
            render={({ field, fieldState }) => (
              <AlSelect
                label="Channel"
                options={[...CHANNEL_OPTIONS]}
                value={field.value}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  field.onChange(event.target.value);
                }}
                errorText={fieldState.error?.message}
                helperText="Go-to-market channel (immutable once frozen)."
              />
            )}
          />

          {channel === 'B2B' ? (
            <Controller
              control={form.control}
              name="planTier"
              render={({ field, fieldState }) => (
                <AlSelect
                  label="Plan tier"
                  placeholder="Select plan tier"
                  options={[...PLAN_TIER_OPTIONS]}
                  value={field.value ?? ''}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    field.onChange(event.target.value || undefined);
                  }}
                  errorText={fieldState.error?.message}
                  helperText="Embedded in the ops batch code (e.g. B2B-500-10072026-SECURE)."
                />
              )}
            />
          ) : null}

          <Controller
            control={form.control}
            name="skuId"
            render={({ field, fieldState }) => (
              <AlSelect
                label="SKU"
                placeholder={
                  channel === 'B2B' && !planTier ? 'Select plan tier first' : 'Select SKU'
                }
                options={skuOptions}
                value={field.value}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  field.onChange(event.target.value);
                }}
                disabled={
                  skusQuery.isFetching ||
                  skuOptions.length === 0 ||
                  (channel === 'B2B' && !planTier)
                }
                errorText={fieldState.error?.message}
                helperText={skuHelper}
              />
            )}
          />

          <Controller
            control={form.control}
            name="totalCount"
            render={({ field, fieldState }) => (
              <AlInput
                label="Total count"
                type="number"
                min={1}
                max={100_000}
                value={field.value}
                onChange={(event) => {
                  field.onChange(event.target.valueAsNumber);
                }}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="How many codes to generate (1–100,000)."
              />
            )}
          />

          {submitError ? <AlText role="alert">{submitError}</AlText> : null}
        </AlStack>
      </form>
    </AlModal>
  );
}
