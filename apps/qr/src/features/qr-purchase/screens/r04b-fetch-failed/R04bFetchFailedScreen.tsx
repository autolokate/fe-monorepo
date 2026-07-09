import { AlIcon } from '@autolokate/icons';

import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index.js';
import type { PurchaseFetchFailedScreenProps } from '../../types-vehicle.js';

/** R04b · Couldn't fetch from Vahan — Figma 579:1663 */
export function R04bFetchFailedScreen({
  onRetry,
  onEnterManually,
}: PurchaseFetchFailedScreenProps) {
  return (
    <PurchaseStatusShell
      ambient="attention"
      title="We couldn't fetch your details"
      description="Your number is saved. Check your connection and try again"
      visual={
        <AlIcon
          name="fetch-failed-halo"
          size={240}
          className="ob-purchase-status-halo"
          aria-hidden
        />
      }
      secondaryFooterLabel={onEnterManually ? 'Enter manually' : undefined}
      onSecondaryFooter={onEnterManually}
      footerLabel="Try again"
      onContinue={onRetry}
    />
  );
}
