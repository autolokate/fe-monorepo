import { z } from 'zod';

import { adminPaymentRefSchema } from '@/platform/validation/admin-openapi-schemas.js';

export const createClawbackSchema = z.object({
  paymentRef: adminPaymentRefSchema,
});

export type CreateClawbackFormValues = z.infer<typeof createClawbackSchema>;
