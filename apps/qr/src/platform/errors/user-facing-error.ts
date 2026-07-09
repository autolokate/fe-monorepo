import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { isTechnicalErrorCode, messageForApiCode } from './api-code-messages';

type DomainError = {
  code?: string;
  message?: string;
};

const DEFAULT_FALLBACK = 'Something went wrong. Please try again.';

function readDomainError(error: unknown): DomainError | null {
  if (!error || typeof error !== 'object') {
    return null;
  }
  const record = error as Record<string, unknown>;
  if (typeof record.message !== 'string' && typeof record.code !== 'string') {
    return null;
  }
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
  };
}

function messageFromNormalizedCode(code: string): string | null {
  switch (code) {
    case 'offline':
      return 'You appear to be offline. Check your connection and try again.';
    case 'timeout':
      return 'The request timed out. Please try again.';
    case 'network':
      return 'Network error. Check your connection and try again.';
    case 'rate_limit':
      return messageForApiCode('rate_limited');
    case 'expired':
    case 'unauthorized':
      return messageForApiCode('unauthorized');
    case 'server_error':
      return 'Something went wrong while processing your request.';
    default:
      return null;
  }
}

function pickReadableMessage(message: string, code?: string | null): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return DEFAULT_FALLBACK;
  }

  const fromCode = messageForApiCode(code);
  if (fromCode) {
    return fromCode;
  }

  if (isTechnicalErrorCode(trimmed)) {
    return messageForApiCode(trimmed) ?? 'Something went wrong while processing your request.';
  }

  return trimmed;
}

/** Resolve a user-facing message from any thrown value or mapped domain error. */
export function resolveUserFacingMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (error == null) {
    return fallback;
  }

  const domain = readDomainError(error);
  if (domain) {
    const fromCode = messageForApiCode(domain.code);
    if (fromCode) {
      return fromCode;
    }
    if (domain.message?.trim()) {
      return pickReadableMessage(domain.message, domain.code);
    }
  }

  if (error instanceof ApiError) {
    const fromCode = messageForApiCode(error.code);
    if (fromCode) {
      return fromCode;
    }
    if (error.message.trim()) {
      return pickReadableMessage(error.message, error.code);
    }
  }

  const normalized = normalizeApiError(error);
  const fromNormalizedCode = messageFromNormalizedCode(normalized.code);
  if (fromNormalizedCode) {
    return fromNormalizedCode;
  }

  if (normalized.message.trim()) {
    return pickReadableMessage(normalized.message, null);
  }

  return fallback;
}
