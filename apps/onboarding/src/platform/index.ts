export { AutolokateRootProvider, type AutolokateRootProviderProps } from './AutolokateRootProvider.js';
export {
  ACTIVATION_FLOW_ENTRIES,
  FLOW_ENTRY_REGISTRY,
  getFlowEntryById,
  isActivationFlowId,
  POST_ACTIVATION_FLOW_ENTRY,
} from './entry/flow-entry-registry.js';
export {
  dispatchPlatformFlow,
  type FlowDispatchDeps,
  type FlowDispatchRequest,
} from './entry/flow-dispatcher.js';
export type {
  FlowDispatchSource,
  FlowEntryDefinition,
  FlowEntryKind,
  PlatformFlowId,
} from './entry/types.js';
export {
  applyActivatedQrToPwaSession,
  dispatchQrPayload,
  type QrDispatchDeps,
} from './qr/dispatch-qr-payload.js';
export {
  buildQrEntryUrl,
  DEMO_QR_ENTRY_URLS,
  QR_ENTRY_BASE_URL,
} from './qr/qr-entry-urls.js';
export {
  extractQrCodeParam,
  hasLegacyQrEntryParams,
  isQrEntryUrl,
  parseQrFromSearchParams,
} from './qr/parse-qr-url.js';
export {
  QR_STATUS,
  isActivatedQrLifecycleStatus,
  isAttachedQrLifecycleStatus,
  isDistributedQrLifecycleStatus,
  isExpiredQrLifecycleStatus,
} from './qr/qr-status.js';
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
} from './qr/qr-dispatch-contract.js';
