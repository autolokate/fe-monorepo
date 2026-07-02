import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const scannerLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-scanner',
});
