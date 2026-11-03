import type { AdminSystemNotificationBody } from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useMutation } from '@tanstack/react-query';

import { resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { submitSystemNotification } from '@/services/users/admin-users-v4-service';

export const BROADCAST_RATE_LIMIT_MESSAGE =
  'Rate limited: each operator can send 10 broadcasts per hour. Your draft is kept — try again later.';

/** 429 `rate_limited` gets its own message; 400 shows the server's text. */
export function describeBroadcastError(error: unknown): string {
  if (error instanceof ApiError && (error.status === 429 || error.code === 'rate_limited')) {
    return BROADCAST_RATE_LIMIT_MESSAGE;
  }
  if (error instanceof ApiError && error.status === 400 && error.message.trim()) {
    return error.message;
  }
  return resolveSubmitErrorMessage(error);
}

/** POST /admin/v1/notifications/system — SYSTEM category, audited `NOTIFICATION_BROADCAST`. */
export function useSystemBroadcast() {
  return useMutation({
    mutationFn: (body: AdminSystemNotificationBody) => submitSystemNotification(body),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Broadcast queued for ${String(result.queued)} account(s).`);
    },
    onError: (error) => {
      const status = error instanceof ApiError ? error.status : null;
      if (status !== 400 && status !== 429) {
        reportAdminApiError(error, { context: 'notifications:broadcast', toast: false });
      }
    },
  });
}
