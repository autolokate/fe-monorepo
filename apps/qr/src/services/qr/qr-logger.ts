import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const qrLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-qr',
});
