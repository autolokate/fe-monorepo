import { AlIcon } from '@autolokate/icons';

import { ConfettiLottie } from '@/components/compositions/confetti-lottie/index';
import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index';
import type { PurchasePlanId } from '../../types-checkout';
import { getPaymentSuccessDescription } from '../../data/purchase-pricing';

import './payment-success-hero.css';

export type R10PaymentSuccessScreenProps = {
  selectedPlanId: PurchasePlanId;
  paidAmountInr: number;
  onDownloadInvoice?: () => void;
  invoiceDownloading?: boolean;
  onContinue?: () => void;
};

/** R10 · Payment success — Figma 193:25 */
export function R10PaymentSuccessScreen({
  selectedPlanId,
  paidAmountInr,
  onDownloadInvoice,
  invoiceDownloading = false,
  onContinue,
}: R10PaymentSuccessScreenProps) {
  return (
    <PurchaseStatusShell
      shellClassName="ob-purchase-success-shell"
      title="Payment successful"
      description={getPaymentSuccessDescription(selectedPlanId, paidAmountInr)}
      secondaryFooterClassName="ob-purchase-success-invoice-link"
      secondaryFooterLabel={
        onDownloadInvoice
          ? invoiceDownloading
            ? 'Preparing invoice…'
            : 'Download tax invoice'
          : undefined
      }
      onSecondaryFooter={onDownloadInvoice}
      celebration={<ConfettiLottie className="ob-purchase-success-hero__confetti" />}
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
