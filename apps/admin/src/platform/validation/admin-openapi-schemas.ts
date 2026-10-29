import { z } from 'zod';

/** OpenAPI QR code path param: `^[A-Z0-9-]{6,32}$` */
export const adminQrCodeSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Z0-9-]{6,32}$/,
    'Enter a valid QR code (6–32 uppercase letters, numbers, or hyphens).',
  );

/** OpenAPI UUID fields */
export const adminUuidSchema = z.uuid('Enter a valid account or record id.');

/** OpenAPI `ClawbackBodyDto.paymentRef`: `^[A-Za-z0-9_]{6,64}$` */
export const adminPaymentRefSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9_]{6,64}$/,
    'Enter a valid payment reference (6–64 letters, numbers, or underscores).',
  );

/**
 * Partner reorder id path param — Nest `ParseUUIDPipe` on
 * `POST /admin/v1/partner-reorders/{id}/fulfil` rejects non-UUIDs with 400.
 */
export const adminReorderIdSchema = adminUuidSchema;

/** OpenAPI ownership transfer id (uuid path param) */
export const adminTransferIdSchema = adminUuidSchema;

/**
 * Admin users phone search — Nest accepts E.164, Indian 10-digit, or 91-prefixed
 * (`ListAdminUsersQueryDto.phone`); FE normalizes before/at submit.
 */
export const adminPhoneE164Schema = z
  .string()
  .trim()
  .regex(
    /^(\+[1-9]\d{6,14}|[6-9]\d{9}|91[6-9]\d{9})$/,
    'Enter +919876543210, a 10-digit Indian mobile, or 91-prefixed.',
  );
