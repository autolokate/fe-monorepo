export {
  evaluatePurchaseRouteAccess,
  isPostActivationQrResolution,
  isPurchaseCheckoutUnlocked,
  isVehiclePurchaseStepBlocked,
  readPurchaseJourneyState,
  resolvePurchaseEntryPath,
} from '@/journey/state/purchase-journey-state-machine';

/** @deprecated Use resolvePurchaseEntryPath */
export { resolvePurchaseEntryPath as getPurchasePostAuthPath } from '@/journey/state/purchase-journey-state-machine';

/** @deprecated Use isVehiclePurchaseStepBlocked */
export { isVehiclePurchaseStepBlocked as shouldSkipVehiclePurchaseSteps } from '@/journey/state/purchase-journey-state-machine';
