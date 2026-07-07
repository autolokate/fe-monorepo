import { z } from 'zod';

import {
  adminQrCodeSchema,
  adminTransferIdSchema,
  adminUuidSchema,
} from '@/platform/validation/admin-openapi-schemas.js';

export const initiateTransferSchema = z.object({
  code: adminQrCodeSchema,
});

export type InitiateTransferFormValues = z.infer<typeof initiateTransferSchema>;

export const approveTransferSchema = z.object({
  transferId: adminTransferIdSchema,
  toAccountId: adminUuidSchema,
});

export type ApproveTransferFormValues = z.infer<typeof approveTransferSchema>;
