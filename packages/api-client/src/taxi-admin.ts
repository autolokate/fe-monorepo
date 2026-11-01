import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { readEnvelopeMeta, unwrapEnvelope } from './envelope';

/** Partner cancel penalty ladder (bps 0–10000 per stage). */
export type TaxiPartnerCancelPenaltyBpsByStage = {
  gt24h: number;
  h2to24: number;
  lt2hOrNoShow: number;
};

/**
 * OpenAPI `TaxiPolicyDto` (Admin) — bps Admin-supplied; no invented money defaults.
 * Optional/nullable fields mirror the BE DTO; a server that predates a field omits it.
 */
export type TaxiPolicyDto = {
  id?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  customerAdvanceBps?: number;
  partnerDepositBps?: number;
  customerNoShowWaitMinutes?: number | null;
  customerNoShowMinContactAttempts?: number | null;
  depositReleaseHoursAfterComplete?: number | null;
  disputeSlaBusinessDays?: number | null;
  partnerCancelPenaltyBpsByStage?: TaxiPartnerCancelPenaltyBpsByStage | null;
  notes?: string | null;
  publishedAt?: string | null;
  [key: string]: unknown;
};

/** Rows of GET /admin/v1/taxi/policy/history (OpenAPI `TaxiPolicyDto[]`, newest first). */
export type TaxiPolicyAuditDto = TaxiPolicyDto & {
  id: string;
  publishedAt?: string | null;
};

/**
 * OpenAPI `UpsertTaxiPolicyDraftBodyDto`. PUT replaces the whole DRAFT, so every field must be
 * sent on every save (an omitted optional field is stored as null).
 */
export type UpsertTaxiPolicyDraftBody = {
  customerAdvanceBps: number;
  partnerDepositBps: number;
  customerNoShowWaitMinutes: number | null;
  customerNoShowMinContactAttempts: number | null;
  depositReleaseHoursAfterComplete: number | null;
  disputeSlaBusinessDays: number | null;
  partnerCancelPenaltyBpsByStage: TaxiPartnerCancelPenaltyBpsByStage | null;
  notes: string | null;
};

/** GET /admin/v1/taxi/policy */
export async function getTaxiPolicy(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyDto> {
  const response = await client.get<unknown>(endpoints.adminTaxi.policy, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TaxiPolicyDto;
}

/** PUT /admin/v1/taxi/policy — create/replace DRAFT */
export async function upsertTaxiPolicyDraft(
  client: ApiClient,
  body: UpsertTaxiPolicyDraftBody,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyDto> {
  const response = await client.put<unknown>(endpoints.adminTaxi.policy, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TaxiPolicyDto;
}

/** POST /admin/v1/taxi/policy/publish */
export async function publishTaxiPolicy(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyDto> {
  const response = await client.post<unknown>(
    endpoints.adminTaxi.policyPublish,
    {},
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as TaxiPolicyDto;
}

/** GET /admin/v1/taxi/policy/history */
export async function listTaxiPolicyHistory(
  client: ApiClient,
  options: { signal?: AbortSignal; limit?: number } = {},
): Promise<TaxiPolicyAuditDto[]> {
  const path =
    options.limit !== undefined
      ? `${endpoints.adminTaxi.policyHistory}?limit=${String(options.limit)}`
      : endpoints.adminTaxi.policyHistory;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TaxiPolicyAuditDto[];
}

/** OpenAPI `ProvisionTaxiBodyDto` */
export type ProvisionTaxiBody = {
  accountId: string;
  orgName: string;
  ownerName: string;
  city?: string;
  area?: string;
};

/** OpenAPI `ProvisionTaxiResultDto` */
export type ProvisionTaxiResultDto = {
  orgId: string;
  staffId: string;
  enrollmentId: string;
  enrollmentStatus: string;
  locationId: string | null;
  converged: boolean;
};

/** POST /admin/v1/taxi/provision — Taxi fixture org + enrollment (never QR). */
export async function provisionTaxi(
  client: ApiClient,
  body: ProvisionTaxiBody,
  options: { signal?: AbortSignal } = {},
): Promise<ProvisionTaxiResultDto> {
  const response = await client.post<unknown>(endpoints.adminTaxi.provision, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ProvisionTaxiResultDto;
}

/* ------------------------------------------------------------------------------------------------
 * Taxi operations (Admin) — CONTRACTS.md "Taxi (be-taxi) / Admin". Coded against the shared
 * contract ahead of deployment: servers that predate these routes answer 404, which callers must
 * render as "not available on this server yet" (never as empty data).
 * ---------------------------------------------------------------------------------------------- */

export const ADMIN_TAXI_BOOKING_STATUSES = [
  'PENDING_ADVANCE',
  'PENDING_PARTNER_DEPOSIT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED_CUSTOMER',
  'CANCELLED_PARTNER',
  'NO_SHOW_CUSTOMER',
  'NO_SHOW_PARTNER',
  'DISPUTED',
] as const;
export type AdminTaxiBookingStatus = (typeof ADMIN_TAXI_BOOKING_STATUSES)[number];

export const ADMIN_TAXI_ENROLLMENT_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;
export type AdminTaxiEnrollmentStatus = (typeof ADMIN_TAXI_ENROLLMENT_STATUSES)[number];

/** Money side of a booking (customer advance or partner deposit) — server-computed amounts. */
export type AdminTaxiMoneySideDto = {
  status: string;
  amountPaise: number | null;
  bps: number | null;
};

/** One checkout attempt (advance or deposit). */
export type AdminTaxiCheckoutDto = {
  id: string;
  /** CUSTOMER_ADVANCE | PARTNER_DEPOSIT */
  kind: string;
  status: string;
  amountPaise: number;
  paymentRef?: string | null;
  providerOrderId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

/** One refund recorded against a booking checkout. */
export type AdminTaxiRefundDto = {
  id: string;
  checkoutId?: string | null;
  kind?: string | null;
  status: string;
  amountPaise: number;
  reason?: string | null;
  providerRefundId?: string | null;
  createdAt: string;
};

/** Row of GET /admin/v1/taxi/bookings. */
export type AdminTaxiBookingSummaryDto = {
  id: string;
  requestId: string;
  orgId: string;
  orgName?: string | null;
  /** {@link AdminTaxiBookingStatus} (string so newer server statuses still render). */
  status: string;
  selectedFareRupees: number;
  pickupLabel?: string | null;
  dropoffLabel?: string | null;
  pickupAt?: string | null;
  customerAdvance?: AdminTaxiMoneySideDto | null;
  partnerDeposit?: AdminTaxiMoneySideDto | null;
  /** Legacy flat side-status fields (BE `TaxiBookingDto`). */
  customerAdvanceStatus?: string | null;
  partnerDepositStatus?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

/** GET /admin/v1/taxi/bookings/{id} — includes checkouts and refunds. */
export type AdminTaxiBookingDetailDto = AdminTaxiBookingSummaryDto & {
  bidId?: string | null;
  vehicleId?: string | null;
  driverAccountId?: string | null;
  customerAccountId?: string | null;
  policyVersionId?: string | null;
  cancelReason?: string | null;
  checkouts: AdminTaxiCheckoutDto[];
  refunds: AdminTaxiRefundDto[];
};

/** Row of GET /admin/v1/taxi/enrollments. */
export type AdminTaxiEnrollmentDto = {
  orgId: string;
  orgName?: string | null;
  enrollmentId?: string | null;
  /** {@link AdminTaxiEnrollmentStatus} */
  status: string;
  reason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ListAdminTaxiBookingsQuery = {
  status?: AdminTaxiBookingStatus;
  cursor?: string;
  limit?: number;
};

export type ListAdminTaxiEnrollmentsQuery = {
  status?: AdminTaxiEnrollmentStatus;
  cursor?: string;
  limit?: number;
};

export type AdminTaxiPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type CancelAdminTaxiBookingBody = {
  reason: string;
  refundAdvance: boolean;
};

function taxiQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Accept either `{data: {items, nextCursor}}` (contract) or `{data: T[], meta.pagination}`
 * (existing admin list convention) so the client survives either server shape.
 */
function readTaxiPage<T>(response: unknown): AdminTaxiPage<T> {
  const data = unwrapEnvelope(response);
  if (Array.isArray(data)) {
    const meta = readEnvelopeMeta(response);
    const pagination = meta?.pagination as { nextCursor?: string | null } | undefined;
    return { items: data as T[], nextCursor: pagination?.nextCursor ?? null };
  }
  if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
    const record = data as { items: T[]; nextCursor?: string | null };
    return { items: record.items, nextCursor: record.nextCursor ?? null };
  }
  return { items: [], nextCursor: null };
}

type TaxiRequestOptions = { signal?: AbortSignal };

function taxiSignal(options: TaxiRequestOptions): TaxiRequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/taxi/bookings?status&cursor */
export async function listAdminTaxiBookings(
  client: ApiClient,
  query: ListAdminTaxiBookingsQuery = {},
  options: TaxiRequestOptions = {},
): Promise<AdminTaxiPage<AdminTaxiBookingSummaryDto>> {
  const path = `${endpoints.adminTaxi.bookings}${taxiQuery({
    status: query.status,
    cursor: query.cursor,
    limit: query.limit,
  })}`;
  const response = await client.get<unknown>(path, taxiSignal(options));
  return readTaxiPage<AdminTaxiBookingSummaryDto>(response);
}

/** GET /admin/v1/taxi/bookings/{id} (incl. checkouts & refunds) */
export async function getAdminTaxiBooking(
  client: ApiClient,
  id: string,
  options: TaxiRequestOptions = {},
): Promise<AdminTaxiBookingDetailDto> {
  const response = await client.get<unknown>(endpoints.adminTaxi.booking(id), taxiSignal(options));
  const data = unwrapEnvelope(response) as Partial<AdminTaxiBookingDetailDto>;
  return {
    ...(data as AdminTaxiBookingDetailDto),
    checkouts: Array.isArray(data.checkouts) ? data.checkouts : [],
    refunds: Array.isArray(data.refunds) ? data.refunds : [],
  };
}

/** POST /admin/v1/taxi/bookings/{id}/cancel {reason, refundAdvance} */
export async function cancelAdminTaxiBooking(
  client: ApiClient,
  id: string,
  body: CancelAdminTaxiBookingBody,
  options: TaxiRequestOptions & { idempotencyKey?: string } = {},
): Promise<AdminTaxiBookingDetailDto> {
  const response = await client.post<unknown>(endpoints.adminTaxi.bookingCancel(id), body, {
    ...taxiSignal(options),
    ...(options.idempotencyKey ? { headers: { 'Idempotency-Key': options.idempotencyKey } } : {}),
  });
  return unwrapEnvelope(response) as AdminTaxiBookingDetailDto;
}

/** POST /admin/v1/taxi/bookings/{id}/deposit/release */
export async function releaseAdminTaxiBookingDeposit(
  client: ApiClient,
  id: string,
  options: TaxiRequestOptions & { idempotencyKey?: string } = {},
): Promise<AdminTaxiBookingDetailDto> {
  const response = await client.post<unknown>(
    endpoints.adminTaxi.bookingDepositRelease(id),
    {},
    {
      ...taxiSignal(options),
      ...(options.idempotencyKey ? { headers: { 'Idempotency-Key': options.idempotencyKey } } : {}),
    },
  );
  return unwrapEnvelope(response) as AdminTaxiBookingDetailDto;
}

/** GET /admin/v1/taxi/enrollments?status */
export async function listAdminTaxiEnrollments(
  client: ApiClient,
  query: ListAdminTaxiEnrollmentsQuery = {},
  options: TaxiRequestOptions = {},
): Promise<AdminTaxiPage<AdminTaxiEnrollmentDto>> {
  const path = `${endpoints.adminTaxi.enrollments}${taxiQuery({
    status: query.status,
    cursor: query.cursor,
    limit: query.limit,
  })}`;
  const response = await client.get<unknown>(path, taxiSignal(options));
  return readTaxiPage<AdminTaxiEnrollmentDto>(response);
}

/** POST /admin/v1/taxi/enrollments/{orgId}/suspend {reason} */
export async function suspendAdminTaxiEnrollment(
  client: ApiClient,
  orgId: string,
  body: { reason: string },
  options: TaxiRequestOptions = {},
): Promise<AdminTaxiEnrollmentDto> {
  const response = await client.post<unknown>(
    endpoints.adminTaxi.enrollmentSuspend(orgId),
    body,
    taxiSignal(options),
  );
  return unwrapEnvelope(response) as AdminTaxiEnrollmentDto;
}

/** POST /admin/v1/taxi/enrollments/{orgId}/reinstate */
export async function reinstateAdminTaxiEnrollment(
  client: ApiClient,
  orgId: string,
  options: TaxiRequestOptions = {},
): Promise<AdminTaxiEnrollmentDto> {
  const response = await client.post<unknown>(
    endpoints.adminTaxi.enrollmentReinstate(orgId),
    {},
    taxiSignal(options),
  );
  return unwrapEnvelope(response) as AdminTaxiEnrollmentDto;
}
