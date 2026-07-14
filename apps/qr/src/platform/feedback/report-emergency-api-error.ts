import type { EmergencyDomainError } from '@/services/emergency/emergency-api-errors';
import { readEmergencyApiUserMessage } from '@/services/emergency/emergency-api-errors';

import { showErrorToast } from './toast';

type Logger = {
  warn: (event: string, context?: Record<string, unknown>) => void;
};

export type ReportEmergencyApiErrorOptions = {
  /** Default true. Set false when the screen already shows the message inline. */
  toast?: boolean;
};

/**
 * Log for engineers.
 * Non-input emergency screens: toast when the backend returned a message.
 * Input emergency screens: pass `{ toast: false }` and render under the field.
 */
export function reportEmergencyApiError(
  logger: Logger,
  event: string,
  error: EmergencyDomainError,
  options?: ReportEmergencyApiErrorOptions,
): string | null {
  const message = readEmergencyApiUserMessage(error);
  logger.warn(event, { error, userMessage: message });
  if (message && options?.toast !== false) {
    showErrorToast(message);
  }
  return message;
}
