import type { PurchasePlanId, PurchaseRiderCount } from '../qr-purchase/types-checkout.js';
import { getPurchasePlanById } from '@/services/plan/plan-service.js';
import {
  B2B_INCLUDES_LABEL,
  B2B_RIDER_ROW_LABEL,
  B2B_SECURE_FEATURES,
  B2B_SHIELD_FEATURES,
} from './b2b-welcome-copy.js';

export type WelcomePlanDisplay = {
  planName: string;
  priceDisplay?: string;
  includesLabel: string;
  features: readonly string[];
  riderRowLabel?: string;
};

function fallbackFeatures(planId: PurchasePlanId): readonly string[] {
  return planId === 'shield' || planId === 'shield-plus'
    ? B2B_SHIELD_FEATURES
    : B2B_SECURE_FEATURES;
}

export function resolveWelcomePlanDisplay(
  planId: PurchasePlanId,
  priceDisplay: string | undefined,
  riderCount: PurchaseRiderCount,
): WelcomePlanDisplay {
  const plan = getPurchasePlanById(planId);
  const showRider = riderCount > 0;

  return {
    planName: plan.name,
    priceDisplay: priceDisplay || undefined,
    includesLabel: plan.includesLabel ?? B2B_INCLUDES_LABEL,
    features: plan.features.length > 0 ? plan.features : fallbackFeatures(planId),
    riderRowLabel: showRider ? B2B_RIDER_ROW_LABEL : undefined,
  };
}
