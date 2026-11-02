import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { readEnvelopeMeta, unwrapEnvelope } from './envelope';

/**
 * Admin Partners directory + garage/taxi requests inbox — Nest `/admin/v1/partners*`,
 * `/admin/v1/taxi/requests*`, OPERATOR plane.
 *
 * Handwritten against BE admin DTO shapes (OA may lag). No fake KYC fields.
 */

export const ADMIN_PARTNER_TYPES = ['GARAGE', 'STORE', 'TAXI'] as const;
export type AdminPartnerType = (typeof ADMIN_PARTNER_TYPES)[number];

export const ADMIN_GARAGE_REQUEST_STATUSES = ['OPEN', 'AWARDED', 'CLOSED'] as const;
export type AdminGarageRequestStatus = (typeof ADMIN_GARAGE_REQUEST_STATUSES)[number];

export const ADMIN_TAXI_REQUEST_STATUSES = [
  'DRAFT',
  'OPEN',
  'AWARDED',
  'EXPIRED',
  'CANCELLED_BY_CUSTOMER',
] as const;
export type AdminTaxiRequestStatus = (typeof ADMIN_TAXI_REQUEST_STATUSES)[number];

export type AdminPartnerReelSummaryDto = {
  reelId: string;
  stableKey: string;
  title: string;
  status: string;
  publishedAt: string | null;
  /** Optional engagement counters — only when the Admin DTO includes them. */
  likeCount?: number;
  commentCount?: number;
  bookmarkCount?: number;
  viewCount?: number;
};

/**
 * OpenAPI `AdminPartnerOrgDto.gstVerification` — storefront GST state (`garage.stores.gst_verification`).
 * There is no `REJECTED`; `null` means the org has no storefront (taxi-only).
 */
export type AdminPartnerGstVerification =
  | 'NOT_SUBMITTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'NEEDS_ATTENTION'
  | 'PENDING_REVIEW';

/** Admin partner directory row (OpenAPI `AdminPartnerOrgDto`). */
export type AdminPartnerOrgDto = {
  orgId: string;
  name: string;
  partnerKind: string;
  orgKind: string | null;
  ownerAccountId: string | null;
  createdAt: string;
  storeId?: string | null;
  storeName?: string | null;
  storeStatus?: string | null;
  /** Storefront GST verification; null for orgs without a storefront (taxi-only). */
  gstVerification: AdminPartnerGstVerification | null;
  /** Submitted GSTIN with the PAN masked (state code + last 3); null when none. */
  gstinMasked: string | null;
  /** Explicit storefront surface (be-garage 0116); taxi-only orgs have none. */
  surfaceType?: 'GARAGE' | 'STORE' | null;
  cities?: string[];
};

export type AdminPartnerOrgDetailDto = AdminPartnerOrgDto & {
  reels: AdminPartnerReelSummaryDto[];
};

export type ListAdminPartnersQuery = {
  type?: AdminPartnerType;
  q?: string;
  limit?: number;
  cursor?: string;
};

export type AdminGarageBidDto = {
  id: string;
  serviceRequestId: string;
  orgId: string;
  amountRupees: number;
  status: string;
  startsOn: string;
  completionHours: number;
  warrantyDays: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminGarageRequestInboxDto = {
  id: string;
  accountId: string;
  vehicleId: string;
  category: string;
  subcategory: string | null;
  title: string | null;
  description: string | null;
  urgency: string;
  locality: string | null;
  city: string | null;
  state: string | null;
  status: string;
  closesAt: string | null;
  sourceReelId: string | null;
  preferredOrgId: string | null;
  createdAt: string;
  updatedAt: string;
  bids: AdminGarageBidDto[];
};

export type ListAdminGarageRequestsQuery = {
  status?: AdminGarageRequestStatus;
  limit?: number;
  cursor?: string;
};

export type AdminTaxiBidDto = {
  id: string;
  requestId: string;
  orgId: string;
  vehicleId: string;
  proposedDriverAccountId: string | null;
  fareRupees: number;
  status: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTaxiRequestInboxDto = {
  id: string;
  accountId: string;
  status: string;
  pickupAt: string;
  pickupLabel: string;
  dropoffLabel: string;
  estimatedFareRupees: number;
  notes: string | null;
  closesAt: string | null;
  createdAt: string;
  updatedAt: string;
  bids: AdminTaxiBidDto[];
};

export type ListAdminTaxiRequestsQuery = {
  status?: AdminTaxiRequestStatus;
  limit?: number;
  cursor?: string;
};

/** Same pagination shape as Discovery admin lists. */
export type AdminPartnersPagination = {
  limit: number;
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
};

export type AdminPartnersPageResult<T> = {
  items: T[];
  pagination: AdminPartnersPagination | null;
  requestId: string | null;
  correlationId: string | null;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

function readPage<T>(response: unknown): AdminPartnersPageResult<T> {
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    items: unwrapEnvelope(response) as T[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as AdminPartnersPagination)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

type RequestOptions = { signal?: AbortSignal };

function signalOption(options: RequestOptions): RequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/partners */
export async function listAdminPartnersPage(
  client: ApiClient,
  query: ListAdminPartnersQuery = {},
  options: RequestOptions = {},
): Promise<AdminPartnersPageResult<AdminPartnerOrgDto>> {
  const path = `${endpoints.admin.partners}${buildQuery({
    type: query.type,
    q: query.q?.trim(),
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, signalOption(options));
  return readPage<AdminPartnerOrgDto>(response);
}

/** GET /admin/v1/partners/{orgId} */
export async function getAdminPartner(
  client: ApiClient,
  orgId: string,
  options: RequestOptions = {},
): Promise<AdminPartnerOrgDetailDto> {
  const response = await client.get<unknown>(endpoints.admin.partner(orgId), signalOption(options));
  return unwrapEnvelope(response) as AdminPartnerOrgDetailDto;
}

/** GET /admin/v1/partners/requests */
export async function listAdminPartnerGarageRequestsPage(
  client: ApiClient,
  query: ListAdminGarageRequestsQuery = {},
  options: RequestOptions = {},
): Promise<AdminPartnersPageResult<AdminGarageRequestInboxDto>> {
  const path = `${endpoints.admin.partnerGarageRequests}${buildQuery({
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, signalOption(options));
  return readPage<AdminGarageRequestInboxDto>(response);
}

/** GET /admin/v1/partners/requests/{id} */
export async function getAdminPartnerGarageRequest(
  client: ApiClient,
  id: string,
  options: RequestOptions = {},
): Promise<AdminGarageRequestInboxDto> {
  const response = await client.get<unknown>(
    endpoints.admin.partnerGarageRequest(id),
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminGarageRequestInboxDto;
}

/** GET /admin/v1/taxi/requests */
export async function listAdminTaxiRequestsPage(
  client: ApiClient,
  query: ListAdminTaxiRequestsQuery = {},
  options: RequestOptions = {},
): Promise<AdminPartnersPageResult<AdminTaxiRequestInboxDto>> {
  const path = `${endpoints.adminTaxi.requests}${buildQuery({
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, signalOption(options));
  return readPage<AdminTaxiRequestInboxDto>(response);
}

/** GET /admin/v1/taxi/requests/{id} */
export async function getAdminTaxiRequest(
  client: ApiClient,
  id: string,
  options: RequestOptions = {},
): Promise<AdminTaxiRequestInboxDto> {
  const response = await client.get<unknown>(
    endpoints.adminTaxi.request(id),
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminTaxiRequestInboxDto;
}

/**
 * Row of GET /admin/v1/partners/kyc — the garage GST review queue (be-garage `AdminPartnerKycItemDto`).
 * Business identifiers only; the decision goes through POST …/garage/orgs/{orgId}/gst-verification.
 */
export type AdminPartnerKycItemDto = {
  orgId: string;
  orgName: string;
  storeId: string;
  storeName: string | null;
  surfaceType: 'GARAGE' | 'STORE';
  storeStatus: 'DRAFT' | 'PUBLISHED';
  /** NOT_SUBMITTED | PENDING | PENDING_REVIEW | VERIFIED | NEEDS_ATTENTION */
  gstVerification: string;
  gstin: string | null;
  registrationKind: 'REGISTERED' | 'UNREGISTERED';
  legalName: string | null;
  tradeName: string | null;
  updatedAt: string;
};

export type ListAdminPartnersKycQuery = {
  status?: string;
  limit?: number;
  cursor?: string;
};

/** GET /admin/v1/partners/kyc?status (server default PENDING_REVIEW) — envelope list + meta.pagination. */
export async function listAdminPartnersKycPage(
  client: ApiClient,
  query: ListAdminPartnersKycQuery = {},
  options: RequestOptions = {},
): Promise<AdminPartnersPageResult<AdminPartnerKycItemDto>> {
  const path = `${endpoints.admin.partnersKyc}${buildQuery({
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, signalOption(options));
  const data = unwrapEnvelope(response);
  if (data && typeof data === 'object' && !Array.isArray(data) && 'items' in data) {
    const record = data as { items: AdminPartnerKycItemDto[]; nextCursor?: string | null };
    const meta = readEnvelopeMeta(response);
    return {
      items: record.items,
      pagination: {
        limit: query.limit ?? record.items.length,
        cursor: query.cursor ?? null,
        nextCursor: record.nextCursor ?? null,
        hasMore: Boolean(record.nextCursor),
      },
      requestId: meta?.requestId ?? null,
      correlationId: meta?.correlationId ?? null,
    };
  }
  return readPage<AdminPartnerKycItemDto>(response);
}
