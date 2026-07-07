import { zodResolver } from '@hookform/resolvers/zod';
import type { BatchSummaryDto } from '@autolokate/api-client';
import { AlButton, AlInput, AlSelect, AlSheet, AlStack, AlText } from '@autolokate/ui';
import { useEffect, useRef, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  CHANNEL_OPTIONS,
  createBatchSchema,
  type CreateBatchFormValues,
} from '@/features/qr-batches/create-batch-schema.js';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations.js';
import { useAdminFormSubmit } from '@/platform/forms/use-admin-form-submit.js';

export type CreateBatchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (batch: BatchSummaryDto) => void;
};

export function CreateBatchSheet({ open, onOpenChange, onCreated }: CreateBatchSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { createBatchMutation, mapMutationError } = useQrBatchMutations();

  const form = useForm<CreateBatchFormValues>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      channel: 'B2C',
      skuId: '',
      totalCount: 500,
    },
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      form.reset({
        channel: 'B2C',
        skuId: '',
        totalCount: 500,
      });
    }
  }, [form, open]);

  const submitError =
    createBatchMutation.isError
      ? mapMutationError(createBatchMutation.error).userMessage
      : null;

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
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create batch"
      description="Set up a new QR batch in draft status."
      footer={
        <AlStack gap="sm" direction="row">
          <AlButton
            type="submit"
            form="create-batch-form"
            loading={createBatchMutation.isPending}
            disabled={createBatchMutation.isPending}
          >
            Create batch
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            disabled={createBatchMutation.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </AlStack>
      }
    >
      <form
        id="create-batch-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        onKeyDown={handleFormKeyDown}
      >
        <AlStack gap="lg">
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

          <Controller
            control={form.control}
            name="skuId"
            render={({ field, fieldState }) => (
              <AlInput
                label="SKU ID"
                mono
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
                helperText="UUID of the SKU this batch is manufactured for."
                autoComplete="off"
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

          {submitError ? (
            <AlText role="alert">{submitError}</AlText>
          ) : null}
        </AlStack>
      </form>
    </AlSheet>
  );
}
