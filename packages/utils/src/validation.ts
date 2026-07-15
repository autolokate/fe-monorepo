const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
const OTP_PATTERN = /^\d{4,6}$/;
const VEHICLE_REGISTRATION_PATTERN = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/i;

export type ValidationResult = { valid: true } | { valid: false; message: string };

/** Validate a 10-digit Indian mobile number. */
export function validateMobileNumber(mobile: string): ValidationResult {
  const digits = mobile.replace(/\D/g, '');

  if (!digits) {
    return { valid: false, message: 'Mobile number is required.' };
  }

  if (!INDIAN_MOBILE_PATTERN.test(digits)) {
    return { valid: false, message: 'Enter a valid 10-digit mobile number.' };
  }

  return { valid: true };
}

/** Validate an OTP code (4–6 digits). */
export function validateOtp(otp: string): ValidationResult {
  const digits = otp.replace(/\D/g, '');

  if (!digits) {
    return { valid: false, message: 'OTP is required.' };
  }

  if (!OTP_PATTERN.test(digits)) {
    return { valid: false, message: 'Enter a valid OTP.' };
  }

  return { valid: true };
}

/** Validate a vehicle registration number (basic Indian format). */
export function validateVehicleRegistration(registration: string): ValidationResult {
  const normalized = registration.trim().replace(/\s+/g, '');

  if (!normalized) {
    return { valid: false, message: 'Vehicle registration is required.' };
  }

  if (!VEHICLE_REGISTRATION_PATTERN.test(normalized)) {
    return { valid: false, message: 'Enter a valid vehicle registration number.' };
  }

  return { valid: true };
}

/** Strip non-digit characters from a phone or OTP input. */
export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}
