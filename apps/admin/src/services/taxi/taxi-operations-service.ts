import {
  cancelAdminTaxiBooking,
  getAdminTaxiBooking,
  listAdminTaxiBookings,
  listAdminTaxiEnrollments,
  listAdminTaxiRevenue,
  reinstateAdminTaxiEnrollment,
  releaseAdminTaxiBookingDeposit,
  resolveAdminTaxiDispute,
  suspendAdminTaxiEnrollment,
  type AdminTaxiBookingDetailDto,
  type AdminTaxiBookingMutationDto,
  type AdminTaxiBookingSummaryDto,
  type AdminTaxiEnrollmentDto,
  type AdminTaxiPage,
  type AdminTaxiRevenueDto,
  type CancelAdminTaxiBookingBody,
  type ListAdminTaxiBookingsQuery,
  type ListAdminTaxiEnrollmentsQuery,
  type ListAdminTaxiRevenueQuery,
  type ResolveAdminTaxiDisputeBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** Taxi operations — CONTRACTS.md be-taxi admin routes (OPERATOR + step_up). */
export function fetchTaxiBookingsPage(
  query: ListAdminTaxiBookingsQuery,
  signal?: AbortSignal,
): Promise<AdminTaxiPage<AdminTaxiBookingSummaryDto>> {
  return listAdminTaxiBookings(getAdminApiClient(), query, signal ? { signal } : {});
}

export function fetchTaxiBooking(
  id: string,
  signal?: AbortSignal,
): Promise<AdminTaxiBookingDetailDto> {
  return getAdminTaxiBooking(getAdminApiClient(), id, signal ? { signal } : {});
}

/** Admin cancel with explicit advance/deposit outcomes (money rules v2). Returns detail + outcome. */
export function submitTaxiBookingCancel(
  id: string,
  body: CancelAdminTaxiBookingBody,
): Promise<AdminTaxiBookingMutationDto> {
  return cancelAdminTaxiBooking(getAdminApiClient(), id, body);
}

/** Rule on a DISPUTED booking. Returns detail + outcome. */
export function submitTaxiDisputeResolve(
  id: string,
  body: ResolveAdminTaxiDisputeBody,
): Promise<AdminTaxiBookingMutationDto> {
  return resolveAdminTaxiDispute(getAdminApiClient(), id, body);
}

/** Return a held deposit now — a real provider refund. Returns detail + outcome. */
export function submitTaxiDepositRelease(
  id: string,
  reason?: string,
): Promise<AdminTaxiBookingMutationDto> {
  return releaseAdminTaxiBookingDeposit(getAdminApiClient(), id, reason ? { reason } : {});
}

/** GET /admin/v1/taxi/revenue — Autolokate revenue ledger (keyset). */
export function fetchTaxiRevenuePage(
  query: ListAdminTaxiRevenueQuery,
  signal?: AbortSignal,
): Promise<AdminTaxiPage<AdminTaxiRevenueDto>> {
  return listAdminTaxiRevenue(getAdminApiClient(), query, signal ? { signal } : {});
}

export function fetchTaxiEnrollmentsPage(
  query: ListAdminTaxiEnrollmentsQuery,
  signal?: AbortSignal,
): Promise<AdminTaxiPage<AdminTaxiEnrollmentDto>> {
  return listAdminTaxiEnrollments(getAdminApiClient(), query, signal ? { signal } : {});
}

export function submitTaxiEnrollmentSuspend(
  orgId: string,
  reason: string,
): Promise<AdminTaxiEnrollmentDto> {
  return suspendAdminTaxiEnrollment(getAdminApiClient(), orgId, { reason });
}

export function submitTaxiEnrollmentReinstate(
  orgId: string,
  reason?: string,
): Promise<AdminTaxiEnrollmentDto> {
  return reinstateAdminTaxiEnrollment(getAdminApiClient(), orgId, reason ? { reason } : {});
}
