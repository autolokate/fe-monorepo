import { ApiError, isStepUpRequiredError } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';

export type DqErrorView = {
  message: string;
  /** 403 step_up — the operator must verify again (sign in again) before the audited read works. */
  stepUp: boolean;
  notFound: boolean;
};

/** Operator-facing text for a failed DriveQuant read. Never echoes response bodies or PII. */
export function dqErrorView(error: unknown, notFoundMessage: string): DqErrorView {
  if (isStepUpRequiredError(error)) {
    return {
      message: 'Your admin verification expired. Sign in again to view driving data.',
      stepUp: true,
      notFound: false,
    };
  }
  if (error instanceof ApiError) {
    if (error.status === 404) return { message: notFoundMessage, stepUp: false, notFound: true };
    if (error.status === 403) {
      return {
        message: 'Your session is not allowed to read driving data (OPERATOR role required).',
        stepUp: false,
        notFound: false,
      };
    }
  }
  return { message: mapAdminApiError(error).userMessage, stepUp: false, notFound: false };
}
