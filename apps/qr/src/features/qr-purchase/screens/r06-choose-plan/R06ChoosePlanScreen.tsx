import { AuthStepShell } from '@/components/auth-step-shell/index';
import { PlanCarousel } from '@/components/compositions/plan-carousel/index';
import type { PurchasePlanId } from '../../types-checkout';
import { getPurchasePlan } from '../../data/purchase-plans';

import '../purchase-phase-b.css';

export type R06ChoosePlanScreenProps = {
  selectedPlanId: PurchasePlanId;
  onSelectPlan: (planId: PurchasePlanId) => void;
  onContinue?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  /** Selected plan is already funded on this QR (from GET /v1/activation/plans). */
  isIncludedPlan?: boolean;
};

/** R06 · Upgrade / continue plan — Figma 183:25 · 243:49 · 243:76 · 243:103 */
export function R06ChoosePlanScreen({
  selectedPlanId,
  onSelectPlan,
  onContinue,
  onSkip,
  onBack,
  showBack = true,
  isIncludedPlan = false,
}: R06ChoosePlanScreenProps) {
  const plan = getPurchasePlan(selectedPlanId);
  const showSkip = Boolean(onSkip) && !isIncludedPlan;
  const footerLabel = isIncludedPlan ? 'Continue' : `Upgrade ${plan.name}`;

  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase ob-auth-shell--plan-screen"
      contentGap="plan"
      title="Upgrade your plan"
      description="From daily essentials to full crash protection"
      footerLabel={footerLabel}
      footerCtaKey={`${selectedPlanId}-${isIncludedPlan ? 'continue' : 'upgrade'}`}
      footerSecondaryLabel={showSkip ? 'Skip for now' : undefined}
      onFooterSecondary={showSkip ? onSkip : undefined}
      footerSecondaryAboveCta={showSkip}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <PlanCarousel selectedPlanId={selectedPlanId} onSelectPlan={onSelectPlan} />
    </AuthStepShell>
  );
}
