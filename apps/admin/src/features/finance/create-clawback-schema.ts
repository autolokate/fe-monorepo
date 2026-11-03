import { z } from 'zod';

import { adminPaymentRefSchema } from '@/platform/validation/admin-openapi-schemas';

/** Optional audit reason — blank, or 3..500 chars (the server's `reason` bound). */
export const optionalAuditReasonSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || value.length >= 3, 'At least 3 characters.')
  .refine((value) => value.length <= 500, 'At most 500 characters.');

export const createClawbackSchema = z.object({
  paymentRef: adminPaymentRefSchema,
  reason: optionalAuditReasonSchema,
});

export type CreateClawbackFormValues = z.infer<typeof createClawbackSchema>;
