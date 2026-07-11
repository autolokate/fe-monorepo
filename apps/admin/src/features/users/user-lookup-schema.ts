import { z } from 'zod';

import { adminPhoneE164Schema } from '@/platform/validation/admin-openapi-schemas';

export const userLookupSchema = z.object({
  phone: adminPhoneE164Schema,
});

export type UserLookupFormValues = z.infer<typeof userLookupSchema>;
