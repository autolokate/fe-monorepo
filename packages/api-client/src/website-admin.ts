import type { PaginationDto } from './admin';
import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { readEnvelopeMeta, unwrapEnvelope } from './envelope';

/**
 * Admin ops for the website "book a session" flow — Nest `/admin/v1/website/*` (OPERATOR + step_up,
 * every write audited). Ops PUBLISH a day's slots (the consumer `/v1/booking-slots` only ever shows
 * published slots) and move bookings PENDING → CONFIRMED → COMPLETED, or CANCEL them. No payment is
 * taken or refunded here.
 */

export const ADMIN_WEBSITE_BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
] as const;
export type AdminWebsiteBookingStatus = (typeof ADMIN_WEBSITE_BOOKING_STATUSES)[number];

/** OpenAPI `AdminBookingSlotDto` — one published slot, with the live booking holding it (if any). */
export type AdminBookingSlotDto = {
  /** `YYYY-MM-DD` */
  slotDate: string;
  /** `HH:MM` */
  startTime: string;
  /** `HH:MM` */
  endTime: string;
  /** `false` = published but closed to new bookings. */
  available: boolean;
  bookingId: string | null;
  bookingStatus: AdminWebsiteBookingStatus | null;
};

/** OpenAPI `AdminSlotInputDto` */
export type AdminBookingSlotInput = {
  startTime: string;
  endTime: string;
  /** Defaults to `true` on the server. */
  available?: boolean;
};

/**
 * OpenAPI `PublishBookingSlotsBodyDto` — the FULL slot set for the day (replaces it; max 96). `[]`
 * unpublishes the day. Removing a slot that holds a live booking → 409 `booking_slot_in_use`.
 */
export type PublishBookingSlotsBody = {
  slots: AdminBookingSlotInput[];
};

/** OpenAPI `AdminWebsiteBookingDto` — no PII (account id only). */
export type AdminWebsiteBookingDto = {
  bookingId: string;
  accountId: string;
  bookingType: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  carProfileId: string | null;
  status: AdminWebsiteBookingStatus;
  createdAt: string;
  updatedAt: string;
};

/** Query for `GET /admin/v1/website/bookings` — keyset-paginated; every field optional. */
export type ListAdminWebsiteBookingsQuery = {
  status?: AdminWebsiteBookingStatus;
  /** `YYYY-MM-DD` */
  date?: string;
  accountId?: string;
  /** 1–100, server default 50. */
  limit?: number;
  cursor?: string;
};

export type AdminWebsiteBookingsPageResult = {
  items: AdminWebsiteBookingDto[];
  pagination: PaginationDto | null;
};

/** The three operator moves; invalid moves answer 409 `website_booking_invalid_transition`. */
export type AdminWebsiteBookingAction = 'confirm' | 'complete' | 'cancel';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** GET /admin/v1/website/booking-slots?from=YYYY-MM-DD&days= (1–62, default 7). */
export async function listAdminBookingSlots(
  client: ApiClient,
  query: { from: string; days?: number },
  options: { signal?: AbortSignal } = {},
): Promise<AdminBookingSlotDto[]> {
  const path = `${endpoints.admin.websiteBookingSlots}${buildQuery({
    from: query.from,
    days: query.days,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminBookingSlotDto[];
}

/** PUT /admin/v1/website/booking-slots/{date} — replace the day's published slot set. */
export async function publishAdminBookingSlots(
  client: ApiClient,
  date: string,
  body: PublishBookingSlotsBody,
  options: { signal?: AbortSignal } = {},
): Promise<AdminBookingSlotDto[]> {
  const response = await client.put<unknown>(endpoints.admin.websiteBookingSlotsDay(date), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminBookingSlotDto[];
}

/** GET /admin/v1/website/bookings — includes pagination meta from the envelope. */
export async function listAdminWebsiteBookingsPage(
  client: ApiClient,
  query: ListAdminWebsiteBookingsQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminWebsiteBookingsPageResult> {
  const path = `${endpoints.admin.websiteBookings}${buildQuery({
    status: query.status,
    date: query.date,
    accountId: query.accountId,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const pagination = readEnvelopeMeta(response)?.pagination;
  return {
    items: unwrapEnvelope(response) as AdminWebsiteBookingDto[],
    pagination:
      pagination && typeof pagination === 'object' && 'hasMore' in pagination
        ? (pagination as PaginationDto)
        : null,
  };
}

/**
 * POST /admin/v1/website/bookings/{id}/confirm|complete|cancel — idempotent on a same-state retry.
 * `reason` is only sent (and audited) for `cancel`.
 */
export async function transitionAdminWebsiteBooking(
  client: ApiClient,
  bookingId: string,
  action: AdminWebsiteBookingAction,
  options: { reason?: string; signal?: AbortSignal } = {},
): Promise<AdminWebsiteBookingDto> {
  const body = action === 'cancel' && options.reason ? { reason: options.reason } : undefined;
  const response = await client.post<unknown>(
    endpoints.admin.websiteBookingTransition(bookingId, action),
    body,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as AdminWebsiteBookingDto;
}
