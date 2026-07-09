import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env.js';

export const qrAttachLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-qr-attach',
});
