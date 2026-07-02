import type { PurchasePlanDefinition, PurchasePlanId } from '../types-checkout.js';

import {
  DEFAULT_PURCHASE_PLAN_ID,
  getPurchasePlanById,
  purchasePlansCatalog,
} from '@/services/plan/index.js';

/** Live plan catalog — populated by plan-service from GET /v1/plans. */
export const PURCHASE_PLANS: readonly PurchasePlanDefinition[] = purchasePlansCatalog;

export { DEFAULT_PURCHASE_PLAN_ID };

export const VALID_PROMO_CODE = 'FRIEND50';

export function getPurchasePlan(planId: PurchasePlanId): PurchasePlanDefinition {
  return getPurchasePlanById(planId);
}
