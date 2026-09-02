import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const checkoutLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-checkout',
});
