import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

import { showErrorToast } from './toast';

type Logger = {
  warn: (event: string, context?: Record<string, unknown>) => void;
};

/** Log structured context for engineers and surface a readable toast for users. */
export function reportUserError(
  logger: Logger,
  event: string,
  error: unknown,
  fallback?: string,
): string {
  const message = resolveUserFacingMessage(error, fallback);
  logger.warn(event, { error, userMessage: message });
  showErrorToast(message);
  return message;
}
