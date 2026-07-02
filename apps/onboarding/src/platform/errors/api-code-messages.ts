/** User-facing copy for known backend error codes. */
export const API_CODE_MESSAGES: Readonly<Record<string, string>> = {
  missing_qr_code: 'Your purchase QR code is missing. Scan your Autolokate sticker or open your purchase link again.',
  already_attached: 'This code is no longer available to attach.',
  not_provisioned: 'This QR code is not ready for activation yet.',
  channel_journey_mismatch: 'This QR code cannot be used for this flow.',
  rate_limited: 'Too many attempts. Please wait a moment and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  validation: 'Please check your details and try again.',
  vehicle_not_found: 'Vehicle not found. Check the registration number and try again.',
  vehicle_already_linked: 'This vehicle is already linked to another account.',
  promo_invalid: 'That promo code is not valid.',
  plan_unavailable: 'This plan is not available right now.',
  payment_failed: 'Payment failed. Please try again.',
  otp_expired: 'This OTP has expired. Request a new one.',
  otp_invalid: 'Incorrect OTP. Please try again.',
};

const TECHNICAL_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export function isTechnicalErrorCode(value: string): boolean {
  return TECHNICAL_CODE_PATTERN.test(value.trim());
}

export function messageForApiCode(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }
  const trimmed = code.trim();
  return API_CODE_MESSAGES[trimmed] ?? API_CODE_MESSAGES[trimmed.toLowerCase()] ?? null;
}
