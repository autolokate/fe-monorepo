import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const promoLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-promo',
});
