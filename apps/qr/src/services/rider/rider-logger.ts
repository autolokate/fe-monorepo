import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const riderLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-riders',
});
