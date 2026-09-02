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

/** Prefer the endpoint's human-readable message; only map codes when the body is empty/technical. */
function pickReadableMessage(message: string, code?: string | null): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return messageForApiCode(code) ?? DEFAULT_FALLBACK;
  }

  if (isTechnicalErrorCode(trimmed)) {
    return (
      messageForApiCode(trimmed) ??
      messageForApiCode(code) ??
      'Something went wrong while processing your request.'
    );
  }

  return trimmed;
}

function resolveFromDomain(domain: DomainError): string | null {
  if (domain.message?.trim()) {
    return pickReadableMessage(domain.message, domain.code);
  }
  return messageForApiCode(domain.code);
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
    const resolved = resolveFromDomain(domain);
    if (resolved) {
      return resolved;
    }
  }

  if (error instanceof ApiError) {
    const resolved = resolveFromDomain({ code: error.code ?? undefined, message: error.message });
    if (resolved) {
      return resolved;
    }
  }

  const normalized = normalizeApiError(error);
  if (normalized.message.trim() && !isTechnicalErrorCode(normalized.message)) {
    return pickReadableMessage(normalized.message, null);
  }

  const fromNormalizedCode = messageFromNormalizedCode(normalized.code);
  if (fromNormalizedCode) {
    return fromNormalizedCode;
  }

  if (normalized.message.trim()) {
    return pickReadableMessage(normalized.message, null);
  }

  return fallback;
}
