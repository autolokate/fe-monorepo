import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const profileLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-profile',
});
