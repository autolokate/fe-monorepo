import type { EmergencyDomainError } from '@/services/emergency/emergency-api-errors.js';
import { readEmergencyApiUserMessage } from '@/services/emergency/emergency-api-errors.js';

import { showErrorToast } from './toast.js';

type Logger = {
  warn: (event: string, context?: Record<string, unknown>) => void;
};

/** Log for engineers; toast only when the backend returned a message body. */
export function reportEmergencyApiError(
  logger: Logger,
  event: string,
  error: EmergencyDomainError,
): string | null {
  const message = readEmergencyApiUserMessage(error);
  logger.warn(event, { error, userMessage: message });
  if (message) {
    showErrorToast(message);
  }
  return message;
}
