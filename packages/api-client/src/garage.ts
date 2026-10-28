import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** OpenAPI `GarageCommercialConfigDto.monthPassDurationKind` */
export type GarageMonthPassDurationKind = 'CALENDAR_MONTH_IST';

/**
 * OpenAPI `GarageCommercialConfigDto` — commercial settings for Garage.
 * `welcomeCredits` / `creditsPerFirstBid` are legacy audit fields (deprecated for bid eligibility).
 */
export type GarageCommercialConfigDto = {
  id: string;
  welcomeCredits: number;
  creditsPerFirstBid: number;
  freeBidLifetimeCount: number;
  dayPassPriceRupees: number;
  monthPassPriceRupees: number;
  dayPassDurationHours: number;
  monthPassDurationKind: GarageMonthPassDurationKind;
  gstRateBps: number;
  updatedByAdminId?: string | null;
  updatedAt: string;
};

/** OpenAPI `UpdateGarageCommercialConfigBodyDto` */
export type UpdateGarageCommercialConfigBody = {
  welcomeCredits: number;
  creditsPerFirstBid: number;
  freeBidLifetimeCount?: number;
  dayPassPriceRupees: number;
  monthPassPriceRupees: number;
  dayPassDurationHours: number;
  monthPassDurationKind: GarageMonthPassDurationKind;
  gstRateBps: number;
};

/** OpenAPI `GarageCommercialConfigAuditDto` */
export type GarageCommercialConfigAuditDto = {
  id: string;
  configId: string;
  adminAccountId: string;
  requestId?: unknown;
  before: UpdateGarageCommercialConfigBody;
  after: UpdateGarageCommercialConfigBody;
  createdAt: string;
};

export type GaragePassKind = 'DAY' | 'MONTH';

/** OpenAPI `GrantPassBodyDto` */
export type GrantGaragePassBody = {
  kind: GaragePassKind;
  idempotencyKey?: string;
};

/** OpenAPI `PassGrantResultDto` */
export type GaragePassGrantResultDto = {
  orgId: string;
  kind: GaragePassKind;
  startsAt: string;
  endsAt: string;
  amountRupees: number;
  purchaseId: string;
};

/** OpenAPI `AdjustFreeBidsBodyDto` */
export type AdjustGarageFreeBidsBody = {
  delta: number;
  note?: string;
  idempotencyKey?: string;
  raiseLifetime?: boolean;
};

/** OpenAPI `FreeBidsBalanceDto` */
export type GarageFreeBidsBalanceDto = {
  orgId: string;
  remaining: number;
  lifetimeGranted: number;
};

/** GET /admin/v1/garage/commercial-config — requires OPERATOR + admin-plane step_up. */
export async function getGarageCommercialConfig(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<GarageCommercialConfigDto> {
  const response = await client.get<unknown>(endpoints.admin.garageCommercialConfig, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageCommercialConfigDto;
}

/** PUT /admin/v1/garage/commercial-config */
export async function updateGarageCommercialConfig(
  client: ApiClient,
  body: UpdateGarageCommercialConfigBody,
  options: { signal?: AbortSignal } = {},
): Promise<GarageCommercialConfigDto> {
  const response = await client.put<unknown>(endpoints.admin.garageCommercialConfig, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageCommercialConfigDto;
}

function buildGarageQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** GET /admin/v1/garage/commercial-config/history — newest first; optional `limit` (OA query string). */
export async function listGarageCommercialConfigHistory(
  client: ApiClient,
  options: { signal?: AbortSignal; limit?: number } = {},
): Promise<GarageCommercialConfigAuditDto[]> {
  const path = `${endpoints.admin.garageCommercialConfigHistory}${buildGarageQuery({
    limit: options.limit,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageCommercialConfigAuditDto[];
}

/** POST /admin/v1/garage/orgs/{orgId}/passes/grant — ops grant only (not partner Razorpay checkout). */
export async function grantGaragePass(
  client: ApiClient,
  orgId: string,
  body: GrantGaragePassBody,
  options: { signal?: AbortSignal } = {},
): Promise<GaragePassGrantResultDto> {
  const response = await client.post<unknown>(endpoints.admin.garageOrgPassGrant(orgId), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GaragePassGrantResultDto;
}

/** POST /admin/v1/garage/orgs/{orgId}/free-bids/adjust */
export async function adjustGarageFreeBids(
  client: ApiClient,
  orgId: string,
  body: AdjustGarageFreeBidsBody,
  options: { signal?: AbortSignal } = {},
): Promise<GarageFreeBidsBalanceDto> {
  const response = await client.post<unknown>(
    endpoints.admin.garageOrgFreeBidsAdjust(orgId),
    body,
    {
      ...(options.signal ? { signal: options.signal } : {}),
    },
  );
  return unwrapEnvelope(response) as GarageFreeBidsBalanceDto;
}

/** OpenAPI `ProvisionGarageBodyDto` */
export type ProvisionGarageBody = {
  accountId: string;
  orgName: string;
  ownerName: string;
  storeName?: string;
  storePhone?: string;
};

/** OpenAPI `ProvisionGarageResultDto` */
export type ProvisionGarageResultDto = {
  orgId: string;
  staffId: string;
  storeId: string;
  kycRecordId: string;
  storeStatus: 'DRAFT' | 'PUBLISHED';
  freeBidsGranted: boolean;
  freeBidsRemaining: number;
  freeBidLifetimeGranted: number;
  converged: boolean;
};

/** POST /admin/v1/garage/provision — OPERATOR + admin-plane step_up. */
export async function provisionGarage(
  client: ApiClient,
  body: ProvisionGarageBody,
  options: { signal?: AbortSignal } = {},
): Promise<ProvisionGarageResultDto> {
  const response = await client.post<unknown>(endpoints.admin.garageProvision, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ProvisionGarageResultDto;
}

/** OpenAPI `PublishStoreResultDto` */
export type PublishGarageStoreResultDto = {
  orgId: string;
  storeId: string;
  status: 'DRAFT' | 'PUBLISHED';
};

/** POST /admin/v1/garage/orgs/{orgId}/publish-store — OPERATOR; Nearby / bidding. */
export async function publishGarageStore(
  client: ApiClient,
  orgId: string,
  options: { signal?: AbortSignal } = {},
): Promise<PublishGarageStoreResultDto> {
  const response = await client.post<unknown>(
    endpoints.admin.garageOrgPublishStore(orgId),
    {},
    {
      ...(options.signal ? { signal: options.signal } : {}),
    },
  );
  return unwrapEnvelope(response) as PublishGarageStoreResultDto;
}
