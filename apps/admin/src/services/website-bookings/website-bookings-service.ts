import {
  listAdminBookingSlots,
  listAdminWebsiteBookingsPage,
  publishAdminBookingSlots,
  transitionAdminWebsiteBooking,
  type AdminBookingSlotDto,
  type AdminBookingSlotInput,
  type AdminWebsiteBookingAction,
  type AdminWebsiteBookingDto,
  type AdminWebsiteBookingsPageResult,
  type ListAdminWebsiteBookingsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/website/booking-slots?from=&days= — published slots + the live booking on each. */
export async function fetchBookingSlots(
  from: string,
  days: number,
  signal?: AbortSignal,
): Promise<AdminBookingSlotDto[]> {
  return listAdminBookingSlots(getAdminApiClient(), { from, days }, { signal });
}

/** PUT /admin/v1/website/booking-slots/{date} — replace the day's slot set (`[]` unpublishes). */
export async function publishBookingSlots(
  date: string,
  slots: AdminBookingSlotInput[],
): Promise<AdminBookingSlotDto[]> {
  return publishAdminBookingSlots(getAdminApiClient(), date, { slots });
}

/** GET /admin/v1/website/bookings — keyset list (no PII). */
export async function fetchWebsiteBookingsPage(
  query: ListAdminWebsiteBookingsQuery,
  signal?: AbortSignal,
): Promise<AdminWebsiteBookingsPageResult> {
  return listAdminWebsiteBookingsPage(getAdminApiClient(), query, { signal });
}

/** POST /admin/v1/website/bookings/{id}/confirm|complete|cancel (audited). */
export async function transitionWebsiteBooking(
  bookingId: string,
  action: AdminWebsiteBookingAction,
  reason?: string,
): Promise<AdminWebsiteBookingDto> {
  return transitionAdminWebsiteBooking(getAdminApiClient(), bookingId, action, {
    ...(reason ? { reason } : {}),
  });
}
