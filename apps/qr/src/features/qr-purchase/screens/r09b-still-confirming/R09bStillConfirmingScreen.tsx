import { AlScreenSpinner } from '@autolokate/ui';

import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index.js';

/** R09b · Still confirming — Figma 579:1687 */
export function R09bStillConfirmingScreen() {
  return (
    <PurchaseStatusShell
      title="Still confirming your payment"
      description="This is taking longer than usual. Your payment is safe, please don't pay again"
      visual={<AlScreenSpinner size="lg" animated aria-label="Still confirming payment" />}
      hideFooter
    />
  );
}
