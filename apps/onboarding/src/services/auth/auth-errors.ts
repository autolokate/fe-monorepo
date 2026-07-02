import { normalizeApiError, type NormalizedErrorCode } from '@autolokate/api-client';

export type AuthOtpErrorKind = 'wrong' | 'expired';

export type MappedAuthError =
  | { type: 'offline' }
  | { type: 'network' }
  | { type: 'timeout' }
  | { type: 'rate_limited' }
  | { type: 'validation' }
  | { type: 'otp'; kind: AuthOtpErrorKind }
  | { type: 'resend_failed' }
  | { type: 'server_error' }
  | { type: 'unknown'; message: string };

function mapNormalizedCode(code: NormalizedErrorCode): MappedAuthError['type'] {
  switch (code) {
    case 'offline':
      return 'offline';
    case 'timeout':
      return 'timeout';
    case 'network':
      return 'network';
    case 'rate_limit':
      return 'rate_limited';
    case 'validation':
      return 'validation';
    case 'server_error':
      return 'server_error';
    default:
      return 'unknown';
  }
}

/** Map normalized API errors into existing onboarding auth UI states. */
export function mapAuthApiError(error: unknown): MappedAuthError {
  const normalized = normalizeApiError(error);

  if (normalized.code === 'expired' || normalized.code === 'unauthorized') {
    const message = normalized.message.toLowerCase();
    if (normalized.code === 'expired' || message.includes('expir')) {
      return { type: 'otp', kind: 'expired' };
    }
    return { type: 'otp', kind: 'wrong' };
  }

  const mappedType = mapNormalizedCode(normalized.code);
  if (mappedType === 'unknown') {
    return { type: 'unknown', message: normalized.message };
  }

  switch (mappedType) {
    case 'offline':
      return { type: 'offline' };
    case 'network':
      return { type: 'network' };
    case 'timeout':
      return { type: 'timeout' };
    case 'rate_limited':
      return { type: 'rate_limited' };
    case 'validation':
      return { type: 'validation' };
    case 'server_error':
      return { type: 'server_error' };
    default:
      return { type: 'unknown', message: normalized.message };
  }
}
