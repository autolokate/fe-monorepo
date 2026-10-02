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

/** OpenAPI partner reorder id (path string) */
export const adminReorderIdSchema = z.string().trim().min(1, 'Reorder ID is required.');

/** OpenAPI ownership transfer id (uuid path param) */
export const adminTransferIdSchema = adminUuidSchema;

/**
 * Accepts how support actually types an Indian number — `9079269147`, `09079269147`,
 * `919079269147`, `+91 90792 69147` — and returns E.164. The backend matches on an exact
 * blind index, so an un-prefixed number would never find the account.
 */
export function normalizeAdminPhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return trimmed;
}

/** OpenAPI `AdminUserLookupQueryDto.phone`: E.164 (`^\+[1-9]\d{6,14}$`) */
export const adminPhoneE164Schema = z
  .string()
  .trim()
  .min(1, 'Enter a phone number.')
  .transform(normalizeAdminPhone)
  .pipe(
    z.string().regex(/^\+[1-9]\d{6,14}$/, 'Enter a 10-digit mobile number or +countrycode number.'),
  );
