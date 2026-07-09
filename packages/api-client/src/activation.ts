import type { ApiClient } from './client';
import type { ApiPlanTier } from './plans';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type ActivationPreviewPartner = {
  name: string;
  kind: string;
};

/** Preview channel values returned by GET /v1/activation/preview. */
export type ActivationPreviewChannel = 'B2B2C' | 'B2B';

export type ActivationPreviewDto = {
  partner: ActivationPreviewPartner | null;
  planTier: ApiPlanTier;
  pricePaise: number;
  riderCount: number;
  vehicleDisplay: string;
  channel: ActivationPreviewChannel;
  paid: boolean;
};

/** B2B2C redeem — claim with QR sticker only. */
export type RedeemActivationB2b2cBody = {
  qrCode: string;
};

/** B2B redeem — entitlement code plus scanned QR sticker. */
export type RedeemActivationB2bBody = {
  code: string;
  qrCode: string;
};

export type RedeemActivationBody = RedeemActivationB2b2cBody | RedeemActivationB2bBody;

export type ActivationRedeemedDto = {
  subscriptionId: string;
  qrStatus: 'ACTIVATED';
};

/** GET /v1/activation/preview — anonymous entitlement preview. */
export async function previewActivation(
  client: ApiClient,
  code: string,
  options?: { signal?: AbortSignal },
): Promise<ActivationPreviewDto> {
  const response = await client.get<unknown>(endpoints.activation.preview(code), {
    skipAuth: true,
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ActivationPreviewDto;
}

/** POST /v1/activation/redeem — activate partner entitlement (authenticated). */
export async function redeemActivation(
  client: ApiClient,
  body: RedeemActivationBody,
  idempotencyKey?: string,
  options?: { signal?: AbortSignal },
): Promise<ActivationRedeemedDto> {
  const response = await client.post<unknown>(endpoints.activation.redeem, body, {
    ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ActivationRedeemedDto;
}
