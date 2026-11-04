import { ApiError, isStepUpRequiredError } from '@autolokate/api-client';

import { sosStateMeta } from '@/features/sos/sos-model';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';

export type SosErrorView = {
  message: string;
  /** 403 step_up — the operator must re-verify (sign in again) before any SOS call works. */
  stepUp: boolean;
  /** The incident moved on (409) or vanished (404) — refetch before retrying. */
  stale: boolean;
};

/** `details.state` — the client stores either the envelope's `error` object or its `details`. */
function detailState(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const record = details as { state?: unknown; details?: unknown };
  if (typeof record.state === 'string') return record.state;
  return record.details && record.details !== details ? detailState(record.details) : null;
}

/** Operator-facing text for a failed SOS read/action. Never includes request bodies or PII. */
export function sosErrorView(error: unknown): SosErrorView {
  if (isStepUpRequiredError(error)) {
    return {
      message: 'Your admin verification expired. Sign in again to keep working this emergency.',
      stepUp: true,
      stale: false,
    };
  }
  if (error instanceof ApiError) {
    if (error.status === 409 && error.code === 'sos_action_not_allowed') {
      const state = detailState(error.details);
      return {
        message: state
          ? `Not allowed now — the incident is "${sosStateMeta(state).label}". The view was refreshed.`
          : 'This action is no longer allowed for the incident. The view was refreshed.',
        stepUp: false,
        stale: true,
      };
    }
    if (error.status === 404) {
      return { message: 'This SOS incident was not found.', stepUp: false, stale: true };
    }
    if (error.status === 403) {
      return {
        message: 'Your session is not allowed to use the SOS console (OPERATOR role required).',
        stepUp: false,
        stale: false,
      };
    }
    if (error.status === 503 && error.code === 'vendor_unavailable') {
      return {
        message:
          'The server cannot store notes right now (encryption unavailable). Try again shortly.',
        stepUp: false,
        stale: false,
      };
    }
  }
  const mapped = mapAdminApiError(error);
  const message =
    mapped.code === 'validation' && mapped.message.trim() ? mapped.message : mapped.userMessage;
  return { message, stepUp: false, stale: false };
}
