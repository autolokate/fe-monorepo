import { createLogger } from '@autolokate/auth';

import { env } from '@/config/env';

export const vehicleLogger = createLogger({
  enabled: env.enableLogs,
  namespace: 'onboarding-vehicle',
});
