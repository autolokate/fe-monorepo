import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const scannerLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-scanner',
});
