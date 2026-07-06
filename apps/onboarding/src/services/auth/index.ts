export { sendOtp, verifyOtp, logout, type SendOtpInput, type VerifyOtpInput, type VerifyOtpResult } from './auth-service.js';
export {
  ensureValidAuthSession,
  hasAuthTokens,
  type AuthSessionValidity,
} from './ensure-valid-auth-session.js';
export { mapAuthApiError, type AuthOtpErrorKind, type MappedAuthError } from './auth-errors.js';
