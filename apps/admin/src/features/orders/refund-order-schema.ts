import { z } from 'zod';

/** OpenAPI `RefundOrderBodyDto.reason`: 3–500 chars. */
export const refundOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Enter a reason of at least 3 characters.')
    .max(500, 'Keep the reason to 500 characters or fewer.'),
});

export type RefundOrderFormValues = z.infer<typeof refundOrderSchema>;
