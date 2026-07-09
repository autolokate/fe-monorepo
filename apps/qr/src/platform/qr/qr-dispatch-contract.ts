import type { PlatformFlowId } from '../entry/types';

/** QR payload types — document-only contract; no backend or scanner implementation. */
export type QrPayloadType = 'purchase' | 'prepaid' | 'b2b2c' | 'activated';

export type QrPurchasePayload = {
  type: 'purchase';
  token: string;
  orgId?: string;
};

export type QrPrepaidPayload = {
  type: 'prepaid';
  voucherId: string;
};

export type QrB2b2cPayload = {
  type: 'b2b2c';
  partnerId: string;
  variant: 'plan-only' | 'plan-rider';
};

export type QrActivatedPayload = {
  type: 'activated';
  vehicleId: string;
  plate: string;
  modelSummary?: string;
  protected?: boolean;
  planLabel?: string;
};

export type QrPayload = QrPurchasePayload | QrPrepaidPayload | QrB2b2cPayload | QrActivatedPayload;

export type QrDispatchErrorCode = 'invalid' | 'expired' | 'offline' | 'unsupported';

export type QrDispatchError = {
  code: QrDispatchErrorCode;
  message: string;
};

export type QrDecodeSuccess = {
  ok: true;
  payload: QrPayload;
};

export type QrDecodeFailure = {
  ok: false;
  error: QrDispatchError;
};

export type QrDecodeResult = QrDecodeSuccess | QrDecodeFailure;

/** Future QR decode service — implement when backend is available. */
export interface QrDecoder {
  decode(qrId: string): Promise<QrDecodeResult>;
}

/** Maps a decoded QR payload to the platform flow registry id. */
export function mapQrPayloadToPlatformFlow(payload: QrPayload): PlatformFlowId {
  if (payload.type === 'activated') {
    return 'postActivation';
  }

  return payload.type;
}

/** Future: convert QR decode result into a dispatcher request. */
export function createQrDispatchRequest(payload: QrPayload): {
  flowId: PlatformFlowId;
  source: 'qrPayload';
} {
  return {
    flowId: mapQrPayloadToPlatformFlow(payload),
    source: 'qrPayload',
  };
}
