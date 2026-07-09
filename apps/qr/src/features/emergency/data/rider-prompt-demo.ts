import type { PurchasePlanId, PurchaseRiderCount } from '../../qr-purchase/types-checkout.js';

/** Demo: transient R0 load failure for Shield + 2 riders on first attempt; retry succeeds. */
export function shouldSimulateRiderPromptLoadFailure(
  planId: PurchasePlanId,
  riderCount: PurchaseRiderCount,
  attempt: number,
): boolean {
  return attempt === 0 && planId === 'shield' && riderCount === 2;
}
