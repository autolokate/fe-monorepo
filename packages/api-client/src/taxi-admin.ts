import { ApiError, type ApiClient } from './client';
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
  'CANCELLED_ADMIN',
  'NO_SHOW_CUSTOMER',
  'NO_SHOW_PARTNER',
  'DISPUTED',
] as const;
export type AdminTaxiBookingStatus = (typeof ADMIN_TAXI_BOOKING_STATUSES)[number];

/** OpenAPI money-side status (customer advance / partner deposit). */
export const ADMIN_TAXI_MONEY_STATUSES = [
  'NONE',
  'PENDING',
  'HELD',
  'APPLIED_TO_FARE',
  'RELEASED',
  'REFUNDED',
  'FORFEITED',
  'PENALIZED',
  'DISPUTED_HOLD',
  'REFUND_PENDING',
  'RELEASE_PENDING_PAYOUT',
] as const;
export type AdminTaxiMoneyStatus = (typeof ADMIN_TAXI_MONEY_STATUSES)[number];

export const ADMIN_TAXI_ENROLLMENT_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;
export type AdminTaxiEnrollmentStatus = (typeof ADMIN_TAXI_ENROLLMENT_STATUSES)[number];

/**
 * Money side of a booking as rendered by Admin: the server status plus, when a checkout exists,
 * the server-computed amount and bps snapshot from that checkout (never computed client-side).
 */
export type AdminTaxiMoneySideDto = {
  status: string;
  amountPaise: number | null;
  bps: number | null;
};

/** OpenAPI `AdminTaxiCheckoutDto` — one checkout attempt (advance or deposit). */
export type AdminTaxiCheckoutDto = {
  id: string;
  kind: 'CUSTOMER_ADVANCE' | 'PARTNER_DEPOSIT';
  /** PENDING_PAYMENT | PAID | FAILED | CANCELLED | CAPTURED_UNAPPLIED (string so newer values render). */
  status: string;
  amountPaise: number;
  customerAdvanceBpsSnapshot: number;
  partnerDepositBpsSnapshot: number | null;
  policyVersionId: string;
  paymentRef: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  capturedPaise: number | null;
  capturedAt: string | null;
  createdAt: string;
};

/** OpenAPI `AdminTaxiRefundDto` — one refund recorded against a booking checkout. */
export type AdminTaxiRefundDto = {
  id: string;
  checkoutId: string;
  kind: 'CUSTOMER_ADVANCE' | 'PARTNER_DEPOSIT';
  /** CUSTOMER_CANCEL | PARTNER_CANCEL | ADMIN_CANCEL | UNAPPLIED_CAPTURE */
  reason: string;
  /** REQUESTED | SUBMITTING | PENDING | PROCESSED | FAILED | NEEDS_RECONCILIATION */
  status: string;
  amountPaise: number;
  providerPaymentId: string;
  providerRefundId: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

/** OpenAPI `AdminTaxiBookingDto` — row of GET /admin/v1/taxi/bookings. */
export type AdminTaxiBookingSummaryDto = {
  id: string;
  requestId: string;
  bidId: string;
  orgId: string;
  accountId: string;
  vehicleId: string;
  driverAccountId: string | null;
  /** {@link AdminTaxiBookingStatus} (string so newer server statuses still render). */
  status: string;
  selectedFareRupees: number;
  currency: 'INR';
  policyVersionId?: string | null;
  /** {@link AdminTaxiMoneyStatus} */
  customerAdvanceStatus: string;
  /** {@link AdminTaxiMoneyStatus} */
  partnerDepositStatus: string;
  contactUnlocked: boolean;
  pickupLabel: string | null;
  dropoffLabel: string | null;
  pickupAt: string | null;
  selectedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledBy: 'CUSTOMER' | 'PARTNER' | 'ADMIN' | null;
  cancelReason: string | null;
  depositReleaseDueAt: string | null;
  depositReleasedAt: string | null;
  depositReleasedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** OpenAPI `AdminTaxiBookingDetailDto` — GET /admin/v1/taxi/bookings/{id} (checkouts + refunds). */
export type AdminTaxiBookingDetailDto = AdminTaxiBookingSummaryDto & {
  checkouts: AdminTaxiCheckoutDto[];
  refunds: AdminTaxiRefundDto[];
};

/** OpenAPI `AdminTaxiEnrollmentDto` — row of GET /admin/v1/taxi/enrollments. */
export type AdminTaxiEnrollmentDto = {
  orgId: string;
  orgName: string | null;
  /** {@link AdminTaxiEnrollmentStatus} */
  status: string;
  enrolledAt: string;
  updatedAt: string;
};

export type ListAdminTaxiBookingsQuery = {
  status?: AdminTaxiBookingStatus;
  cursor?: string;
  limit?: number;
};

/** The enrollments list takes `status` and `limit` only (no cursor paging). */
export type ListAdminTaxiEnrollmentsQuery = {
  status?: AdminTaxiEnrollmentStatus;
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

/** Admin lists answer `{data: T[], meta: {pagination}}` (OpenAPI admin list convention). */
function readTaxiPage<T>(response: unknown): AdminTaxiPage<T> {
  const data = unwrapEnvelope(response);
  if (!Array.isArray(data)) {
    throw new ApiError('Invalid admin taxi list response', 0, 'invalid_response');
  }
  const pagination = readEnvelopeMeta(response)?.pagination as
    | { nextCursor?: string | null }
    | undefined;
  return { items: data as T[], nextCursor: pagination?.nextCursor ?? null };
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
