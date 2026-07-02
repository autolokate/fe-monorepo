import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const activationLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-activation',
});
