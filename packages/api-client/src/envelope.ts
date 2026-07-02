/** Standard Autolokate API success envelope. */
export type ApiEnvelope<T> = {
  data: T;
  meta: {
    requestId: string;
    correlationId: string;
    pagination?: unknown;
  };
};

/** Standard Autolokate API error envelope. */
export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
    correlationId: string;
  };
};

export function unwrapEnvelope(payload: unknown): unknown {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as ApiEnvelope<unknown>).data !== undefined
  ) {
    return (payload as ApiEnvelope<unknown>).data;
  }
  return payload;
}

export function readEnvelopeMeta(payload: unknown): ApiEnvelope<unknown>['meta'] | null {
  if (payload && typeof payload === 'object' && 'meta' in payload) {
    return (payload as ApiEnvelope<unknown>).meta;
  }
  return null;
}
