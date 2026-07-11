import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const deviceLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-device',
});
