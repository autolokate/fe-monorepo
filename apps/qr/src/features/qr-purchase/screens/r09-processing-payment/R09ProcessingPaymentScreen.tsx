import { AlScreenSpinner } from '@autolokate/ui';

import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index.js';

/** R09 · Processing payment — Figma 192:25 */
export function R09ProcessingPaymentScreen() {
  return (
    <PurchaseStatusShell
      title="Processing your payment"
      description="Securing your payment. You haven't been charged yet"
      visual={<AlScreenSpinner size="lg" animated aria-label="Processing payment" />}
      hideFooter
    />
  );
}
