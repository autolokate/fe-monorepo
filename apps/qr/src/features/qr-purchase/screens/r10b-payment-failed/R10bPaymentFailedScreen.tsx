import { AlIcon } from '@autolokate/icons';

import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index.js';

export type R10bPaymentFailedScreenProps = {
  onRetry?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

/** R10b · Payment failed — Figma 194:25 */
export function R10bPaymentFailedScreen({
  onRetry,
  onBack,
  showBack = true,
}: R10bPaymentFailedScreenProps) {
  return (
    <PurchaseStatusShell
      ambient="attention"
      showBack={showBack}
      onBack={onBack}
      title="Payment didn't go through"
      description="You haven't been charged. Want to try again?"
      visual={
        <AlIcon
          name="fetch-failed-halo"
          size={240}
          className="ob-purchase-status-halo"
          aria-hidden
        />
      }
      footerLabel="Retry payment"
      onContinue={onRetry}
    />
  );
}
