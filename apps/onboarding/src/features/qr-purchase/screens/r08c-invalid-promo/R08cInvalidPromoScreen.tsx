import { AuthStepShell } from '@/components/auth-step-shell/index.js';
import { OrderSummaryCard } from '@/components/compositions/order-summary-card/index.js';
import { PromoCodeField } from '@/components/compositions/promo-code-field/index.js';
import type { PurchasePlanId, PurchaseRiderCount } from '../../types-checkout.js';
import { buildOrderSummary } from '../../data/purchase-pricing.js';

import '../purchase-phase-b.css';

export type R08cInvalidPromoScreenProps = {
  selectedPlanId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoCode: string;
  onPromoCodeChange?: (code: string) => void;
  onApplyPromo?: () => void;
  isApplyingPromo?: boolean;
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

/** R08c · Order summary · promo invalid — Figma 579:1748 */
export function R08cInvalidPromoScreen({
  selectedPlanId,
  riderCount,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  isApplyingPromo = false,
  onContinue,
  onBack,
  showBack = true,
}: R08cInvalidPromoScreenProps) {
  const summary = buildOrderSummary({
    planId: selectedPlanId,
    riderCount,
    promoApplied: false,
  });

  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase"
      title="Review & pay"
      description="Check your order, then pay securely"
      footerLabel={summary.payCtaLabel}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      contentGap="mobile"
    >
      <div className="ob-purchase-phase-b-stack">
        <PromoCodeField
          variant="invalid"
          promoCode={promoCode}
          onPromoCodeChange={onPromoCodeChange}
          onApply={onApplyPromo}
          isApplying={isApplyingPromo}
          errorMessage="That code isn't valid, check and try again"
        />
        <OrderSummaryCard summary={summary} />
        <p className="ob-purchase-gateway-note">
          Pay securely by UPI, card or netbanking on the next screen
        </p>
      </div>
    </AuthStepShell>
  );
}
