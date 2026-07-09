export {
  resolveQrCode,
  resolveQrEntry,
  refreshQrResolution,
  getStoredPurchaseQrResolve,
  clearResolvedQrCache,
  peekResolvedQr,
  type ResolveQrCodeResult,
} from './qr-service.js';
export { attachPurchaseQr, isPurchaseAttachReady, resetAttachAttemptCache, type AttachPurchaseQrResult } from './qr-attach-service.js';
export { mapQrAttachApiError, type QrAttachError, type QrAttachErrorCode } from './qr-attach-errors.js';
export { mapQrApiError, mapQrStatusError } from './qr-errors.js';
export {
  mapQrJourneyToActivationFlow,
  mapResolutionToPayload,
  isExpiredQrStatus,
  isActivatedQrResolution,
} from './qr-mapper.js';
export {
  enterJourneyFromQrCode,
  enterJourneyFromQrSearchParams,
  type QrJourneyEntryDeps,
  type QrJourneyEntryPoint,
  type QrJourneyEntryResult,
} from './qr-journey-entry.js';
export {
  getPurchasePostAuthPath,
  isVehiclePurchaseStepBlocked,
  isPostActivationQrResolution,
  shouldSkipVehiclePurchaseSteps,
} from './qr-journey-routing.js';
export {
  buildAttachedPurchaseSessionPatch,
  ensureAttachedPurchaseContext,
  seedAttachedPurchaseFromResolve,
} from './seed-attached-purchase-from-resolve.js';
