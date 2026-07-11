import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const activationLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-activation',
});
