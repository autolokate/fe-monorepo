import type {
  AuthMobileState,
  AuthOtpState,
} from '@/features/shared-auth/types';
import type { MappedAuthError } from '@/services/auth/auth-errors';

export function applyMobileSendError(error: MappedAuthError): AuthMobileState {
  if (error.type === 'offline') {
    return 'offline';
  }
  if (
    error.type === 'network' ||
    error.type === 'timeout' ||
    error.type === 'server_error' ||
    error.type === 'rate_limited' ||
    error.type === 'validation'
  ) {
    return 'error';
  }
  return 'error';
}

export function applyOtpVerifyError(error: MappedAuthError): {
  otpState: AuthOtpState;
  otpErrorKind: 'wrong' | 'expired' | null;
} {
  if (error.type === 'offline') {
    return { otpState: 'offline', otpErrorKind: null };
  }
  if (error.type === 'network' || error.type === 'timeout' || error.type === 'server_error') {
    return { otpState: 'network-error', otpErrorKind: null };
  }
  if (error.type === 'otp') {
    return { otpState: 'error', otpErrorKind: error.kind };
  }
  return { otpState: 'error', otpErrorKind: 'wrong' };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
