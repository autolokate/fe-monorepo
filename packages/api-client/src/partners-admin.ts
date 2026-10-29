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

/** Admin partner directory row — no fake KYC status fields. */
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
  /** Present when BE partner detail includes store GST; optional until DTO ships. */
  gstVerification?: string | null;
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
