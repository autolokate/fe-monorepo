import { AuthStepShell } from '@/components/auth-step-shell/index';
import { OrderSummaryCard } from '@/components/compositions/order-summary-card/index';
import { PromoCodeField } from '@/components/compositions/promo-code-field/index';
import type { PurchasePlanId, PurchaseRiderCount } from '../../types-checkout';
import { buildOrderSummary } from '../../data/purchase-pricing';

import '../purchase-phase-b.css';

export type R08OrderSummaryScreenProps = {
  selectedPlanId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoCode?: string;
  onPromoCodeChange?: (code: string) => void;
  onApplyPromo?: () => void;
  isApplyingPromo?: boolean;
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  /** Cart/checkout API message — shown above the Pay CTA. */
  errorMessage?: string | null;
  footerLabel?: string;
  footerLoading?: boolean;
};

/** R08 · Order summary — Figma 190:25 */
export function R08OrderSummaryScreen({
  selectedPlanId,
  riderCount,
  promoCode = '',
  onPromoCodeChange,
  onApplyPromo,
  isApplyingPromo = false,
  onContinue,
  onBack,
  showBack = true,
  errorMessage = null,
  footerLabel,
  footerLoading = false,
}: R08OrderSummaryScreenProps) {
  const summary = buildOrderSummary({
    planId: selectedPlanId,
    riderCount,
    promoApplied: false,
  });
  const resolvedError = errorMessage?.trim() || null;

  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase"
      title="Review & pay"
      description="Check your order, then pay securely"
      footerLabel={footerLabel ?? summary.payCtaLabel}
      footerLoading={footerLoading}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      ctaHelper={resolvedError ?? undefined}
      ctaHelperTone={resolvedError ? 'warning' : 'muted'}
      contentGap="mobile"
    >
      <div className="ob-purchase-phase-b-stack">
        <PromoCodeField
          variant="editable"
          promoCode={promoCode}
          onPromoCodeChange={onPromoCodeChange}
          onApply={onApplyPromo}
          isApplying={isApplyingPromo}
        />
        <OrderSummaryCard summary={summary} />
        <p className="ob-purchase-gateway-note">
          Pay securely by UPI, card or netbanking on the next screen
        </p>
      </div>
    </AuthStepShell>
  );
}
