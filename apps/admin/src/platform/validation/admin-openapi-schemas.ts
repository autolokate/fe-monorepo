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
export const adminUuidSchema = z.uuid('Enter a valid UUID.');

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

/** OpenAPI `AdminUserLookupQueryDto.phone`: E.164 (`^\+[1-9]\d{6,14}$`) */
export const adminPhoneE164Schema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, 'Enter an E.164 phone number, e.g. +919876543210.');
