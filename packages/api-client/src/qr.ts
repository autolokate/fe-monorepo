import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

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

/** Sales channel from GET /v1/qr/{code}/resolve (OpenAPI QrResolutionDto). */
export type QrChannel = 'B2C' | 'B2B2C' | 'B2B';

export type QrJourney = 'CONSUMER_PREPAID' | 'PARTNER_ATTACH' | 'PREPAID_REDEEM' | 'NONE';

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
