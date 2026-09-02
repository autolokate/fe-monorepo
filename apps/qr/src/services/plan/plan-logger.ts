import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const planLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-plan',
});
