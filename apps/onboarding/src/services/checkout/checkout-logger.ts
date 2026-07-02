import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const checkoutLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-checkout',
});
