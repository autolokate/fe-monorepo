import { AuthStepShell } from '@/components/auth-step-shell/index';
import {
  mapRiderOptionsToView,
  RiderCoverOptions,
} from '@/components/compositions/rider-cover-options/index';
import type { PurchasePlanId, PurchaseRiderCount, PurchaseRiderOption } from '../../types-checkout';
import { getRiderCtaLabel } from '../../data/purchase-pricing';

import '../purchase-phase-b.css';

export type R07RiderCoverScreenProps = {
  selectedPlanId: PurchasePlanId;
  riderOptions: readonly PurchaseRiderOption[];
  selectedRiderCount: Exclude<PurchaseRiderCount, 0>;
  onSelectRiderCount: (count: Exclude<PurchaseRiderCount, 0>) => void;
  onSkip?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

/** R07 · Add rider cover — Figma 186:25 */
export function R07RiderCoverScreen({
  selectedPlanId: _selectedPlanId,
  riderOptions,
  selectedRiderCount,
  onSelectRiderCount,
  onSkip,
  onContinue,
  onBack,
  showBack = true,
}: R07RiderCoverScreenProps) {
  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase ob-auth-shell--rider-screen"
      title="Add rider cover?"
      description="Cover whoever rides with you. Add rider protection at a bundled price."
      footerLabel={getRiderCtaLabel(selectedRiderCount)}
      footerCtaKey={String(selectedRiderCount)}
      footerSecondaryLabel={onSkip ? "Skip, I'll ride solo" : undefined}
      onFooterSecondary={onSkip}
      footerSecondaryAboveCta={Boolean(onSkip)}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      contentGap="mobile"
    >
      <div className="ob-purchase-phase-b-stack">
        <RiderCoverOptions
          options={mapRiderOptionsToView(riderOptions)}
          selectedCount={selectedRiderCount}
          onSelect={onSelectRiderCount}
        />
      </div>
    </AuthStepShell>
  );
}
