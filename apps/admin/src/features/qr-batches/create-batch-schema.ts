import type { ApiPlanTier, QrBatchChannel } from '@autolokate/api-client';
import { z } from 'zod';

/** B2B fleet pins — SAFE is retail-only, not offered on prepaid B2B batches. */
const b2bPlanTiers = ['SECURE', 'SHIELD', 'SHIELD_PLUS'] as const satisfies readonly ApiPlanTier[];

export const createBatchSchema = z
  .object({
    channel: z.enum(['B2C', 'B2B2C', 'B2B'] satisfies [QrBatchChannel, ...QrBatchChannel[]]),
    skuId: z.uuid('Select a SKU.'),
    totalCount: z
      .number({ message: 'Total count is required.' })
      .int('Total count must be a whole number.')
      .min(1, 'Minimum batch size is 1.')
      .max(100_000, 'Maximum batch size is 100,000.'),
    planTier: z.enum(b2bPlanTiers).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.channel === 'B2B' && !values.planTier) {
      ctx.addIssue({
        code: 'custom',
        path: ['planTier'],
        message: 'Plan tier is required for B2B batches.',
      });
    }
  });

export type CreateBatchFormValues = z.infer<typeof createBatchSchema>;

export const qrCodeActionSchema = z.object({
  code: z.string().trim().min(1, 'Enter a QR code.'),
});

export type QrCodeActionFormValues = z.infer<typeof qrCodeActionSchema>;

export const CHANNEL_OPTIONS = [
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'B2B', label: 'B2B' },
] as const;

/** B2B create-batch plan picker (ops batch_code) — no SAFE. */
export const PLAN_TIER_OPTIONS = [
  { value: 'SECURE', label: 'SECURE' },
  { value: 'SHIELD', label: 'SHIELD' },
  { value: 'SHIELD_PLUS', label: 'SHIELD PLUS' },
] as const;
