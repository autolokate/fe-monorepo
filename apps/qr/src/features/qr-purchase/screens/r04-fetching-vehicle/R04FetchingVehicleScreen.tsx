import { AlScreenSpinner } from '@autolokate/ui';

import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index.js';
import type { PurchaseFetchingScreenProps } from '../../types-vehicle.js';

/** R04 · Fetching details — Figma 179:25 */
export function R04FetchingVehicleScreen({
  title = 'Fetching your vehicle details',
  description = 'Reading your RC from Vahan, one moment',
}: PurchaseFetchingScreenProps) {
  return (
    <PurchaseStatusShell
      title={title}
      description={description}
      visual={<AlScreenSpinner size="lg" animated aria-label={title} />}
      hideFooter
    />
  );
}
