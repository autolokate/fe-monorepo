import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const cartLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-cart',
});
