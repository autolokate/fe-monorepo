import { z } from 'zod';

import { adminReorderIdSchema } from '@/platform/validation/admin-openapi-schemas';

export const fulfilPartnerReorderSchema = z.object({
  reorderId: adminReorderIdSchema,
});

export type FulfilPartnerReorderFormValues = z.infer<typeof fulfilPartnerReorderSchema>;
