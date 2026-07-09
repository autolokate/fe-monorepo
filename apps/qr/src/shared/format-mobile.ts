/**
 * Canonical mobile display formatters for onboarding flows.
 * Local: "98765 43210" · Intl: "+91 98765 43210"
 */

/** Figma local spacing — 5+5 digits, no country code. */
export function formatMobileLocal(value: string): string {
  const digits = value.replace(/\D/g, '').slice(-10);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** Figma emergency/contact display — +91 prefix. */
export function formatMobileIntl(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return mobile.startsWith('+') ? mobile : `+91 ${mobile}`;
}

/** @deprecated Use formatMobileLocal */
export function formatMobileForOtpDescription(mobile: string): string {
  return formatMobileLocal(mobile);
}

/** @deprecated Use formatMobileLocal or formatMobileIntl explicitly */
export function formatMobileForDisplay(value: string, variant: 'local' | 'intl' = 'local'): string {
  return variant === 'intl' ? formatMobileIntl(value) : formatMobileLocal(value);
}
