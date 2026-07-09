import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const planLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-plan',
});
