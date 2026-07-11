import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const profileLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-profile',
});
