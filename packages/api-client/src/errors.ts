import { ApiError } from './client';

export type NormalizedErrorCode =
  | 'validation'
  | 'unauthorized'
  | 'expired'
  | 'offline'
  | 'timeout'
  | 'network'
  | 'rate_limit'
  | 'server_error'
  | 'unknown';

export type NormalizedApiError = {
  code: NormalizedErrorCode;
  message: string;
  status: number | null;
  requestId: string | null;
  correlationId: string | null;
  details: unknown;
  cause: unknown;
};

function readMetaIds(details: unknown): {
  requestId: string | null;
  correlationId: string | null;
} {
  if (!details || typeof details !== 'object') {
    return { requestId: null, correlationId: null };
  }
  const record = details as Record<string, unknown>;
  return {
    requestId: typeof record['requestId'] === 'string' ? record['requestId'] : null,
    correlationId: typeof record['correlationId'] === 'string' ? record['correlationId'] : null,
  };
}

/** Map any thrown value into a stable error shape for feature services. */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      code: 'offline',
      message: 'You appear to be offline.',
      status: null,
      requestId: null,
      correlationId: null,
      details: null,
      cause: error,
    };
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      code: 'timeout',
      message: 'The request timed out.',
      status: null,
      requestId: null,
      correlationId: null,
      details: null,
      cause: error,
    };
  }

  if (error instanceof TypeError) {
    return {
      code: 'network',
      message: error.message || 'Network request failed.',
      status: null,
      requestId: null,
      correlationId: null,
      details: null,
      cause: error,
    };
  }

  if (error instanceof ApiError) {
    const { requestId, correlationId } = readMetaIds(error.details);
    const message = error.message.toLowerCase();

    let code: NormalizedErrorCode = 'unknown';
    if (error.status === 429 || error.code === 'rate_limited') {
      code = 'rate_limit';
    } else if (error.status === 400 || error.code === 'validation') {
      code = 'validation';
    } else if (error.status === 401 || error.code === 'unauthorized') {
      code = message.includes('expir') ? 'expired' : 'unauthorized';
    } else if (error.status >= 500) {
      code = 'server_error';
    } else if (error.code === 'invalid_response') {
      code = 'server_error';
    } else if (error.status === 0) {
      code = 'network';
    }

    return {
      code,
      message: error.message,
      status: error.status,
      requestId,
      correlationId,
      details: error.details,
      cause: error,
    };
  }

  return {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'Something went wrong.',
    status: null,
    requestId: null,
    correlationId: null,
    details: null,
    cause: error,
  };
}
