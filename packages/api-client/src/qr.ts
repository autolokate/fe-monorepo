import type { ApiClient } from './client.js';
import { endpoints } from './endpoints.js';
import { unwrapEnvelope } from './envelope.js';

export type QrStatus =
  | 'MANUFACTURED'
  | 'PROVISIONED'
  | 'DISTRIBUTED'
  | 'ATTACHED'
  | 'ATTACHED_UNPAID'
  | 'ACTIVATED'
  | 'LAPSED'
  | 'TRANSFERRED'
  | 'CANCELLED'
  | 'REPLACED_LOST'
  | 'RETIRED';

export type QrChannel =
  | 'B2C_RETAIL_ONLINE'
  | 'B2C_RETAIL_OFFLINE'
  | 'PARTNER_DISTRIBUTED'
  | 'B2B2C_AUTHORISED'
  | 'B2B_FLEET';

export type QrJourney = 'CONSUMER_SELF_PAY' | 'PARTNER_ATTACH' | 'PREPAID_REDEEM' | 'NONE';

export type QrOfferedSku = {
  skuCode: string;
  offeredTiers: string[];
  listPricePaise: number;
  riderDefault: number;
  prepaid: boolean;
};

export type QrPublicVehicle = {
  plate: string;
  color: string | null;
  make: string | null;
  model: string | null;
  protection: 'PROTECTED' | 'EXPIRING' | 'UNPROTECTED';
};

export type QrResolution = {
  qrStatus: QrStatus;
  channel: QrChannel;
  journey: QrJourney;
  offeredSku: QrOfferedSku | null;
  vehicle: QrPublicVehicle | null;
};

export type ConsumerAttachBody = {
  registration?: string;
};

export type ConsumerAttachQrStatus = 'ATTACHED' | 'ACTIVATED';

export type ConsumerAttachResult = {
  attachEventId: string;
  vehicleId: string;
  qrStatus: ConsumerAttachQrStatus;
  subscriptionId: string | null;
};

/** GET /v1/qr/{code}/resolve — anonymous QR resolution. */
export async function resolveQr(client: ApiClient, code: string): Promise<QrResolution> {
  const response = await client.get<unknown>(endpoints.qr.resolve(code), { skipAuth: true });
  return unwrapEnvelope(response) as QrResolution;
}

/** POST /v1/qr/{code}/attach — bind a scanned code to the owner's vehicle. */
export async function attachQr(
  client: ApiClient,
  code: string,
  body: ConsumerAttachBody,
): Promise<ConsumerAttachResult> {
  const response = await client.post<unknown>(endpoints.qr.attach(code), body);
  return unwrapEnvelope(response) as ConsumerAttachResult;
}
