/** Demo OTP validators for mock flows (emergency, PWA bystander). Not used in production shared-auth. */

export function isExpiredOtp(value: string): boolean {
  return value === '000000';
}

export function isValidOtp(value: string): boolean {
  return value === '123456';
}
