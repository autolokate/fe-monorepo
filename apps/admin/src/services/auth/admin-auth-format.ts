import { toE164IndianMobile } from '@autolokate/api-client';

/** Normalise a 10-digit Indian mobile for admin OTP APIs. */
export function formatAdminLoginMobile(localDigits: string): string {
  return toE164IndianMobile(localDigits);
}
