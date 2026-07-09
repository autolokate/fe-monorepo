import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';
import { mapAdminApiError, type AdminApiError } from '@/platform/errors/admin-api-errors';
import { showErrorToast } from '@/platform/feedback/toast';

const logger = createLogger({ enabled: env.enableLogs, namespace: 'admin-api' });

export type ReportAdminApiErrorOptions = {
  /** Diagnostic label for structured logging. */
  context?: string;
  toast?: boolean;
};

/** Log structured admin API failures and optionally surface a toast. */
export function reportAdminApiError(error: unknown, options: ReportAdminApiErrorOptions): AdminApiError {
  const mapped = mapAdminApiError(error);
  logger.error('Admin API failure', {
    context: options.context ?? 'unknown',
    code: mapped.code,
    message: mapped.userMessage,
    cause: error,
  });
  if (options.toast !== false) {
    showErrorToast(mapped.userMessage);
  }
  return mapped;
}
