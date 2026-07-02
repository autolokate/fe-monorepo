import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const qrLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-qr',
});
