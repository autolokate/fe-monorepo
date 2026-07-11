export { AutolokateRootProvider, type AutolokateRootProviderProps } from './AutolokateRootProvider';
export {
  ACTIVATION_FLOW_ENTRIES,
  FLOW_ENTRY_REGISTRY,
  getFlowEntryById,
  isActivationFlowId,
  POST_ACTIVATION_FLOW_ENTRY,
} from './entry/flow-entry-registry';
export {
  dispatchPlatformFlow,
  type FlowDispatchDeps,
  type FlowDispatchRequest,
} from './entry/flow-dispatcher';
export type {
  FlowDispatchSource,
  FlowEntryDefinition,
  FlowEntryKind,
  PlatformFlowId,
} from './entry/types';
export {
  applyActivatedQrToPwaSession,
  dispatchQrPayload,
  type QrDispatchDeps,
} from './qr/dispatch-qr-payload';
export {
  buildQrDeepLinkUrl,
  QR_ENTRY_BASE_URL,
} from './qr/qr-entry-urls';
export {
  extractQrCodeParam,
  hasLegacyQrEntryParams,
  isQrEntryUrl,
  parseQrFromSearchParams,
} from './qr/parse-qr-url';
export {
  QR_STATUS,
  isActivatedQrLifecycleStatus,
  isAttachedQrLifecycleStatus,
  isDistributedQrLifecycleStatus,
  isExpiredQrLifecycleStatus,
} from './qr/qr-status';
export {
  createQrDispatchRequest,
  mapQrPayloadToPlatformFlow,
  type QrActivatedPayload,
  type QrB2b2cPayload,
  type QrDecodeFailure,
  type QrDecodeResult,
  type QrDecodeSuccess,
  type QrDecoder,
  type QrDispatchError,
  type QrDispatchErrorCode,
  type QrPayload,
  type QrPayloadType,
  type QrPrepaidPayload,
  type QrPurchasePayload,
} from './qr/qr-dispatch-contract';
