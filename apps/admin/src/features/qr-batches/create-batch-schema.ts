import type { QrBatchChannel } from '@autolokate/api-client';
import { z } from 'zod';

export const createBatchSchema = z.object({
  channel: z.enum(['B2C', 'B2B2C', 'B2B'] satisfies [QrBatchChannel, ...QrBatchChannel[]]),
  skuId: z.uuid('Enter a valid SKU UUID.'),
  totalCount: z
    .number({ message: 'Total count is required.' })
    .int('Total count must be a whole number.')
    .min(1, 'Minimum batch size is 1.')
    .max(100_000, 'Maximum batch size is 100,000.'),
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
