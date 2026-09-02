import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const qrAttachLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'qr-qr-attach',
});
