export function normalizeMobile(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}

export function formatMobileInput(value: string): string {
  const digits = normalizeMobile(value);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
}

/** Clamp typed input to 10 digits and apply display spacing. */
export function clampMobileInput(value: string): string {
  return formatMobileInput(value.replace(/\D/g, '').slice(0, 10));
}

export const MOBILE_DIGIT_MAX = 10;
export const MOBILE_INPUT_DISPLAY_MAX = 11;

export function isValidMobile(value: string): boolean {
  const digits = normalizeMobile(value);
  return /^[6-9]\d{9}$/.test(digits);
}

export const OTP_LENGTH = 6;

/** Figma resend countdown starts at 0:24 */
export const RESEND_COOLDOWN_SECONDS = 24;
