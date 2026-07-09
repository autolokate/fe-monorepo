import { getEmergencyPlanLimits, resolvePurchasePlanId } from '../../features/emergency/emergency-limits.js';
import type { EmergencyPlanLimits } from '../../features/emergency/emergency-limits.js';
import type { PurchasePlanId, PurchaseRiderCount } from '../../features/qr-purchase/types-checkout.js';
import { activationStorageRepository } from '@/platform/storage/repositories/activation-storage-repository.js';
import type { ActivationFlowId, JourneySession } from '../types.js';

export type EmergencyFoundationContext = {
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  limits: EmergencyPlanLimits;
  /** B2C purchase uses plan caps; partner flows use preview.riderCount only. */
  flowKind: 'purchase' | 'partner';
};

function clampRiderCount(count: number): PurchaseRiderCount {
  if (count >= 2) {
    return 2;
  }
  if (count >= 1) {
    return 1;
  }
  return 0;
}

function resolvePartnerPreviewRiderCount(): PurchaseRiderCount {
  const preview = activationStorageRepository.read()?.preview;
  if (!preview) {
    return 0;
  }
  return clampRiderCount(preview.riderCount);
}

function isPartnerActivationFlow(selectedFlow: ActivationFlowId | null | undefined): boolean {
  return selectedFlow === 'prepaid' || selectedFlow === 'b2b2c';
}

/** Reads purchase / preview fields that drive emergency foundation rules. */
export function resolveEmergencyFoundationContext(
  session: Pick<JourneySession, 'purchase'>,
  selectedFlow?: ActivationFlowId | null,
): EmergencyFoundationContext {
  const planId = resolvePurchasePlanId(session.purchase?.selectedPlanId);
  const partnerFlow = isPartnerActivationFlow(selectedFlow);
  const riderCount: PurchaseRiderCount = partnerFlow
    ? resolvePartnerPreviewRiderCount()
    : (session.purchase?.riderCount ?? 0);

  return {
    planId,
    riderCount,
    flowKind: partnerFlow ? 'partner' : 'purchase',
    limits: getEmergencyPlanLimits(planId),
  };
}
