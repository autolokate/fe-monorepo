import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const deviceLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-device',
});
