import {
  cancelAdminTaxiBooking,
  getAdminTaxiBooking,
  listAdminTaxiBookings,
  listAdminTaxiEnrollments,
  reinstateAdminTaxiEnrollment,
  releaseAdminTaxiBookingDeposit,
  suspendAdminTaxiEnrollment,
  type AdminTaxiBookingDetailDto,
  type AdminTaxiBookingSummaryDto,
  type AdminTaxiEnrollmentDto,
  type AdminTaxiPage,
  type CancelAdminTaxiBookingBody,
  type ListAdminTaxiBookingsQuery,
  type ListAdminTaxiEnrollmentsQuery,
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

export function submitTaxiBookingCancel(
  id: string,
  body: CancelAdminTaxiBookingBody,
  idempotencyKey: string,
): Promise<AdminTaxiBookingDetailDto> {
  return cancelAdminTaxiBooking(getAdminApiClient(), id, body, { idempotencyKey });
}

export function submitTaxiDepositRelease(
  id: string,
  idempotencyKey: string,
): Promise<AdminTaxiBookingDetailDto> {
  return releaseAdminTaxiBookingDeposit(getAdminApiClient(), id, { idempotencyKey });
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

export function submitTaxiEnrollmentReinstate(orgId: string): Promise<AdminTaxiEnrollmentDto> {
  return reinstateAdminTaxiEnrollment(getAdminApiClient(), orgId);
}
