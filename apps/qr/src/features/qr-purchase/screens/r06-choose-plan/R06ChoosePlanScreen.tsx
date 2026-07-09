import { AuthStepShell } from '@/components/auth-step-shell/index.js';
import { PlanCarousel } from '@/components/compositions/plan-carousel/index.js';
import type { PurchasePlanId } from '../../types-checkout.js';
import { getPurchasePlan } from '../../data/purchase-plans.js';

import '../purchase-phase-b.css';

export type R06ChoosePlanScreenProps = {
  selectedPlanId: PurchasePlanId;
  onSelectPlan: (planId: PurchasePlanId) => void;
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

/** R06 · Choose plan — Figma 183:25 · 243:49 · 243:76 · 243:103 */
export function R06ChoosePlanScreen({
  selectedPlanId,
  onSelectPlan,
  onContinue,
  onBack,
  showBack = true,
}: R06ChoosePlanScreenProps) {
  const plan = getPurchasePlan(selectedPlanId);

  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase ob-auth-shell--plan-screen"
      contentGap="plan"
      title="Choose your plan"
      description="From daily essentials to full crash protection"
      footerLabel={`Choose ${plan.name}`}
      footerCtaKey={selectedPlanId}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <PlanCarousel selectedPlanId={selectedPlanId} onSelectPlan={onSelectPlan} />
    </AuthStepShell>
  );
}
