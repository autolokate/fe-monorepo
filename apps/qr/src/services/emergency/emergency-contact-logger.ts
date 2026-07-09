import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const emergencyContactLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-emergency-contacts',
});
