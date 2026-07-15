import { AlStack } from '@autolokate/ui';

import { AddContactRow, EmergencyContactRow } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout';
import {
  canAddRider,
  getEntitledRiderSlots,
  getRidersMaxReachedMessage,
  getRidersSummaryDescription,
  type EmergencyFlowKind,
} from '../../emergency-limits';
import type { EmergencyRider, EmergencyScreenNavigationProps } from '../../types';

export type E10RidersSummaryScreenProps = EmergencyScreenNavigationProps & {
  riders: EmergencyRider[];
  planId: PurchasePlanId;
  purchasedRiderSlots: PurchaseRiderCount;
  flowKind?: EmergencyFlowKind;
  footerDisabled?: boolean;
  onAddAnother?: () => void;
};

/** R4 · Riders added — Figma 822:1980 · 824:2014 */
export function E10RidersSummaryScreen({
  riders,
  planId,
  purchasedRiderSlots,
  flowKind = 'purchase',
  footerDisabled = false,
  onAddAnother,
  onContinue,
  onBack,
  showBack = true,
}: E10RidersSummaryScreenProps) {
  const count = riders.length;
  const entitled = getEntitledRiderSlots(planId, purchasedRiderSlots, flowKind);
  const canAddMore = canAddRider(count, planId, purchasedRiderSlots, flowKind);
  const isMaxReached = count >= entitled && entitled > 0;

  return (
    <FlowStepShell
      phase="emergency"
      step={5}
      title="Riders"
      description={getRidersSummaryDescription(count, planId, purchasedRiderSlots, flowKind)}
      footerLabel="Continue"
      footerDisabled={footerDisabled}
      hideProgress
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <AlStack gap="md" className="ob-contact-card-list">
        {riders.map((rider) => (
          <EmergencyContactRow key={`${rider.mobile}-${rider.name}`} contact={rider} />
        ))}
        {canAddMore ? (
          <AddContactRow
            label="Add another rider"
            onClick={onAddAnother}
            disabled={!onAddAnother}
          />
        ) : isMaxReached ? (
          <p className="ob-emergency-max-message">
            {getRidersMaxReachedMessage(planId, purchasedRiderSlots, flowKind)}
          </p>
        ) : null}
      </AlStack>
    </FlowStepShell>
  );
}
