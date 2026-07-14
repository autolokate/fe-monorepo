import type { ApiClient } from './client';
import type { ApiPlanTier, PlanPeriod } from './plans';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type ActivationPreviewPartner = {
  name: string;
  kind: string | null;
};

/** Preview channel values returned by GET /v1/activation/preview. */
export type ActivationPreviewChannel = 'B2C' | 'B2B2C' | 'B2B';

export type ActivationPreviewDto = {
  partner: ActivationPreviewPartner | null;
  planTier: ApiPlanTier;
  pricePaise: number;
  riderCount: number;
  /** Display name of the sold/pinned plan version (not the tier enum). */
  planName: string;
  /** Server-driven card copy for the pinned plan version. */
  features: string[];
  channel: ActivationPreviewChannel | null;
  paid: boolean;
  /** Optional plate/summary when the activation is already bound to a vehicle. */
  vehicleDisplay?: string | null;
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

export type FundedPlanBy = 'MARKETPLACE' | 'PURCHASE';

/** Already-funded plan from GET /v1/activation/plans. */
export type FundedPlanDto = {
  planId: string;
  tier: ApiPlanTier;
  name: string;
  pricePaise: number;
  fundedBy: FundedPlanBy;
  payablePaise: number;
  riderCount: number;
  riderEligible: boolean;
  features: string[];
  badge?: string | null;
  includesLabel?: string | null;
};

/** Rider quote on an upgrade option from GET /v1/activation/plans. */
export type UpgradeRiderQuoteDto = {
  riderCount: number;
  payablePaise: number;
  discountPercent: number;
};

/** Difference-priced upgrade option from GET /v1/activation/plans. */
export type UpgradeOptionDto = {
  planId: string;
  tier: ApiPlanTier;
  name: string;
  pricePaise: number;
  payablePaise: number;
  period: PlanPeriod;
  version: number;
  riderEligible: boolean;
  riderOptions: UpgradeRiderQuoteDto[];
  features: string[];
  badge?: string | null;
  includesLabel?: string | null;
};

/** Authenticated B2C prepaid plans screen payload. */
export type ActivationPlansDto = {
  funded: FundedPlanDto;
  options: UpgradeOptionDto[];
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

/** GET /v1/activation/plans — funded plan + difference-priced upgrades (authenticated). */
export async function listActivationPlans(
  client: ApiClient,
  code: string,
  options?: { signal?: AbortSignal },
): Promise<ActivationPlansDto> {
  const response = await client.get<unknown>(endpoints.activation.plans(code), {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ActivationPlansDto;
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
