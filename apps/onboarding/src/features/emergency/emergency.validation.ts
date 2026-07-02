export { isExpiredOtp, isValidOtp } from '../shared-auth/auth-flow/auth-flow.demo.js';
export {
  isValidMobile,
  normalizeMobile,
  clampMobileInput,
  formatMobileInput,
  MOBILE_DIGIT_MAX,
  MOBILE_INPUT_DISPLAY_MAX,
} from '../shared-auth/auth-flow/auth-flow.validation.js';

export function isValidEmergencyName(value: string): boolean {
  return value.trim().length >= 2;
}
