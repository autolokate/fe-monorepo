import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const authLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-auth',
});
