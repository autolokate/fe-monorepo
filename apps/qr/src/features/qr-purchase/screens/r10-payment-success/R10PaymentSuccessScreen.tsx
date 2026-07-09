import { AlIcon } from '@autolokate/icons';

import { ConfettiLottie } from '@/components/compositions/confetti-lottie/index.js';
import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index.js';
import type { PurchasePlanId } from '../../types-checkout.js';
import { getPaymentSuccessDescription } from '../../data/purchase-pricing.js';

import './payment-success-hero.css';

export type R10PaymentSuccessScreenProps = {
  selectedPlanId: PurchasePlanId;
  paidAmountInr: number;
  onContinue?: () => void;
};

/** R10 · Payment success — Figma 193:25 */
export function R10PaymentSuccessScreen({
  selectedPlanId,
  paidAmountInr,
  onContinue,
}: R10PaymentSuccessScreenProps) {
  return (
    <PurchaseStatusShell
      title="Payment successful"
      description={getPaymentSuccessDescription(selectedPlanId, paidAmountInr)}
      celebration={
        <ConfettiLottie className="ob-purchase-success-hero__confetti" />
      }
      visual={
        <div className="ob-purchase-success-hero">
          <AlIcon
            name="payment-success-halo"
            size={240}
            className="ob-purchase-status-halo"
            aria-hidden
          />
        </div>
      }
      footerLabel="Continue"
      onContinue={onContinue}
    />
  );
}
