import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/**
 * OpenAPI `GarageCommercialConfigDto.monthPassDurationKind`.
 * Flow v3 adds `ROLLING_DAYS` (window = `monthPassDurationDays` from purchase).
 */
export type GarageMonthPassDurationKind = 'CALENDAR_MONTH_IST' | 'ROLLING_DAYS';

/** Flow v3 server limits for the weekly free-bid allowance and ROLLING_DAYS month pass. */
export const GARAGE_FREE_BIDS_PER_WEEK_MAX = 100;
export const GARAGE_MONTH_PASS_DURATION_DAYS_MIN = 1;
export const GARAGE_MONTH_PASS_DURATION_DAYS_MAX = 366;

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
  /**
   * Flow v3 — MONTH pass window (days) when `monthPassDurationKind = ROLLING_DAYS`.
   * Optional: absent on servers that predate flow v3.
   */
  monthPassDurationDays?: number;
  /**
   * Flow v3 — free bids per garage org per IST week (0-100, reset Monday 00:00 IST).
   * Optional: absent on servers that predate flow v3.
   */
  freeBidsPerWeek?: number;
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
  /** Flow v3 — optional; omitted → server keeps the current value. */
  monthPassDurationDays?: number;
  /** Flow v3 — optional; omitted → server keeps the current value. */
  freeBidsPerWeek?: number;
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

/**
 * OpenAPI `AdjustFreeBidsBodyDto`. Since flow v3 the signed `delta` is a bonus/penalty for the
 * CURRENT IST week only (it resets with the week); `raiseLifetime` is ignored by v3 servers.
 */
export type AdjustGarageFreeBidsBody = {
  delta: number;
  note?: string;
  idempotencyKey?: string;
  raiseLifetime?: boolean;
};

/**
 * OpenAPI `FreeBidsBalanceDto`. On flow v3 servers `remaining` is this IST week's remaining free bids
 * and `lifetimeGranted` is this week's total allowance including the admin bonus.
 */
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

/** OpenAPI `GarageStoreDto.gstVerification` */
/**
 * `PENDING_REVIEW` — partner self-verified via the sandbox vendor; only a live vendor or an
 * operator decision may move it to `VERIFIED` (CONTRACTS.md, be-garage).
 */
export type GarageGstVerification =
  | 'NOT_SUBMITTED'
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'NEEDS_ATTENTION';

/** OpenAPI `AdminSetGarageGstVerificationDto` */
export type SetGarageGstVerificationBody = {
  gstVerification: GarageGstVerification;
};

/** OpenAPI `GarageStoreDto` (admin GST / store entitlement subset). */
export type GarageStoreDto = {
  id: string;
  orgId: string;
  name: string | null;
  phone: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  businessSubmitted: boolean;
  gstVerification: GarageGstVerification;
  onboarded: boolean;
};

/** POST /admin/v1/garage/orgs/{orgId}/gst-verification — OPERATOR. */
export async function setGarageGstVerification(
  client: ApiClient,
  orgId: string,
  body: SetGarageGstVerificationBody,
  options: { signal?: AbortSignal } = {},
): Promise<GarageStoreDto> {
  const response = await client.post<unknown>(
    endpoints.admin.garageOrgGstVerification(orgId),
    body,
    {
      ...(options.signal ? { signal: options.signal } : {}),
    },
  );
  return unwrapEnvelope(response) as GarageStoreDto;
}

/** Workshops taxonomy (migrate 0097) — platform vehicle / category / subcategory. */
export type GarageTaxonomyVehicleDto = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GarageTaxonomySubcategoryDto = {
  id: string;
  categoryId: string;
  slug: string;
  label: string;
  sortOrder: number;
  visible: boolean;
  legacyCsvId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type GarageTaxonomyCategoryDto = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories: GarageTaxonomySubcategoryDto[];
};

export type GarageTaxonomyTreeDto = {
  vehicleCategories: GarageTaxonomyVehicleDto[];
  categories: GarageTaxonomyCategoryDto[];
  storeSubcategoryIds?: string[];
};

export type UpsertGarageTaxonomyItemBody = {
  label: string;
  slug?: string;
  sortOrder?: number;
  visible?: boolean;
};

export type UpsertGarageTaxonomySubcategoryBody = UpsertGarageTaxonomyItemBody & {
  categoryId: string;
  legacyCsvId?: number | null;
};

/** GET /admin/v1/garage/taxonomy — needs migrate 0097. */
export async function getAdminGarageTaxonomy(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomyTreeDto> {
  const response = await client.get<unknown>(endpoints.admin.garageTaxonomy, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageTaxonomyTreeDto;
}

export async function createGarageVehicleCategory(
  client: ApiClient,
  body: UpsertGarageTaxonomyItemBody,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomyVehicleDto> {
  const response = await client.post<unknown>(
    endpoints.admin.garageTaxonomyVehicleCategories,
    body,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as GarageTaxonomyVehicleDto;
}

export async function updateGarageVehicleCategory(
  client: ApiClient,
  id: string,
  body: Partial<UpsertGarageTaxonomyItemBody>,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomyVehicleDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.garageTaxonomyVehicleCategory(id),
    body,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as GarageTaxonomyVehicleDto;
}

export async function createGarageBusinessCategory(
  client: ApiClient,
  body: UpsertGarageTaxonomyItemBody,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomyCategoryDto> {
  const response = await client.post<unknown>(endpoints.admin.garageTaxonomyCategories, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageTaxonomyCategoryDto;
}

export async function updateGarageBusinessCategory(
  client: ApiClient,
  id: string,
  body: Partial<UpsertGarageTaxonomyItemBody>,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomyCategoryDto> {
  const response = await client.patch<unknown>(endpoints.admin.garageTaxonomyCategory(id), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageTaxonomyCategoryDto;
}

export async function createGarageSubcategory(
  client: ApiClient,
  body: UpsertGarageTaxonomySubcategoryBody,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomySubcategoryDto> {
  const response = await client.post<unknown>(endpoints.admin.garageTaxonomySubcategories, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as GarageTaxonomySubcategoryDto;
}

export async function updateGarageSubcategory(
  client: ApiClient,
  id: string,
  body: Partial<UpsertGarageTaxonomySubcategoryBody>,
  options: { signal?: AbortSignal } = {},
): Promise<GarageTaxonomySubcategoryDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.garageTaxonomySubcategory(id),
    body,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as GarageTaxonomySubcategoryDto;
}
