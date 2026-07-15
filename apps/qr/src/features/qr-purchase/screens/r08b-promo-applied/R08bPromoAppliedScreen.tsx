import { AuthStepShell } from '@/components/auth-step-shell/index';
import { OrderSummaryCard } from '@/components/compositions/order-summary-card/index';
import { PromoCodeField } from '@/components/compositions/promo-code-field/index';
import type { PurchasePlanId, PurchaseRiderCount } from '../../types-checkout';
import { buildOrderSummary } from '../../data/purchase-pricing';

import '../purchase-phase-b.css';

export type R08bPromoAppliedScreenProps = {
  selectedPlanId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoCode: string;
  onRemovePromo?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  /** Cart/checkout API message — shown above the Pay CTA. */
  errorMessage?: string | null;
  footerLabel?: string;
  footerLoading?: boolean;
};

/** R08b · Order summary · promo applied — Figma 333:37 */
export function R08bPromoAppliedScreen({
  selectedPlanId,
  riderCount,
  promoCode,
  onRemovePromo,
  onContinue,
  onBack,
  showBack = true,
  errorMessage = null,
  footerLabel,
  footerLoading = false,
}: R08bPromoAppliedScreenProps) {
  const summary = buildOrderSummary({
    planId: selectedPlanId,
    riderCount,
    promoApplied: true,
    promoCode,
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
        <PromoCodeField variant="applied" promoCode={promoCode} onRemove={onRemovePromo} />
        <OrderSummaryCard summary={summary} />
        <p className="ob-purchase-gateway-note">
          Pay securely by UPI, card or netbanking on the next screen
        </p>
      </div>
    </AuthStepShell>
  );
}
