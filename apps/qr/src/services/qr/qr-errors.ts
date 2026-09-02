import { normalizeApiError } from '@autolokate/api-client';

import type { QrDispatchError, QrDispatchErrorCode } from '@/platform/qr/qr-dispatch-contract';
import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

function inactiveMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('inactive') ||
    lower.includes('attached') ||
    lower.includes('unavailable') ||
    lower.includes('retired') ||
    lower.includes('lapsed')
  );
}

function expiredMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('expir') || lower.includes('replaced') || lower.includes('lapsed');
}

/** Map API failures into existing QR dispatch error codes (no new UI). */
export function mapQrApiError(error: unknown): QrDispatchError {
  const normalized = normalizeApiError(error);
  const message = resolveUserFacingMessage(error);

  if (normalized.code === 'offline') {
    return { code: 'offline', message };
  }

  if (normalized.code === 'timeout' || normalized.code === 'network') {
    return { code: 'offline', message };
  }

  if (normalized.status === 404 || normalized.code === 'validation') {
    return { code: 'invalid', message };
  }

  if (normalized.status === 410 || expiredMessage(normalized.message)) {
    return { code: 'expired', message };
  }

  if (inactiveMessage(normalized.message)) {
    return { code: 'invalid', message };
  }

  if (normalized.code === 'server_error') {
    return { code: 'unsupported', message };
  }

  return { code: 'invalid', message };
}

export function mapQrStatusError(
  message: string,
  code: QrDispatchErrorCode = 'expired',
): QrDispatchError {
  return { code, message };
}
