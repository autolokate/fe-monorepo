import { z } from 'zod';

/** OpenAPI QR code path param: `^[A-Z0-9-]{6,32}$` */
export const adminQrCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9-]{6,32}$/, 'Enter a valid QR code (6–32 uppercase letters, numbers, or hyphens).');

/** OpenAPI UUID fields */
export const adminUuidSchema = z.uuid('Enter a valid UUID.');

/** OpenAPI `ClawbackBodyDto.paymentRef`: `^[A-Za-z0-9_]{6,64}$` */
export const adminPaymentRefSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{6,64}$/, 'Enter a valid payment reference (6–64 letters, numbers, or underscores).');

/** OpenAPI partner reorder id (path string) */
export const adminReorderIdSchema = z.string().trim().min(1, 'Reorder ID is required.');

/** OpenAPI ownership transfer id (uuid path param) */
export const adminTransferIdSchema = adminUuidSchema;
