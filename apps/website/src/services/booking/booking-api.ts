"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiService } from "@/services/api.service";
import type {
  BookingEnvelope,
  BookingSlotsQuery,
  CreateBookingPayload,
} from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Unwrap `{ success, data }` envelopes; return the raw value for anything else. */
function unbox<T>(res: BookingEnvelope<T>): T {
  if (isRecord(res) && "data" in res) return (res as { data: T }).data;
  return res as T;
}

/** GET /v1/bookings/slots — optional `date` + `range_days` filters. */
export async function getBookingSlots(query: BookingSlotsQuery = {}): Promise<unknown[]> {
  const params: Record<string, string | number> = {};
  if (query.date) params.date = query.date;
  if (query.range_days != null) params.range_days = query.range_days;

  const res = await ApiService.get<BookingEnvelope<unknown[]>>(endpoints.bookings.slots, {
    params,
  });
  return unbox(res.data) ?? [];
}

/** GET /v1/bookings/slots/{yyyy-MM-dd} — same as above but for a single day. */
export async function getBookingSlotsByDate(dateIso: string): Promise<unknown[]> {
  const res = await ApiService.get<BookingEnvelope<unknown[]>>(
    endpoints.bookings.slotsByDate(dateIso),
  );
  return unbox(res.data) ?? [];
}

/**
 * POST /v1/bookings/book — payload mirrors `CreateBookingDto`.
 * Only the fields declared in the DTO are sent to avoid validation rejections.
 */
export async function createBooking(payload: CreateBookingPayload): Promise<unknown> {
  const body: Record<string, unknown> = {
    slot_date: payload.slot_date,
    slot_start_time: payload.slot_start_time,
    slot_end_time: payload.slot_end_time,
    booking_type: payload.booking_type,
  };
  if (payload.car_profile_id) body.car_profile_id = payload.car_profile_id;

  const res = await ApiService.post<BookingEnvelope<unknown>>(
    endpoints.bookings.create,
    body,
  );
  return unbox(res.data);
}

/** GET /v1/bookings/my — bookings owned by the signed-in user. */
export async function getMyBookings(): Promise<unknown[]> {
  const res = await ApiService.get<BookingEnvelope<unknown[]>>(endpoints.bookings.my);
  return unbox(res.data) ?? [];
}

/** GET /v1/bookings/{id} — single booking lookup. */
export async function getBookingById(bookingId: string): Promise<unknown> {
  const res = await ApiService.get<BookingEnvelope<unknown>>(
    endpoints.bookings.byId(bookingId),
  );
  return unbox(res.data);
}

/** POST /v1/bookings/{id}/cancel. */
export async function cancelBooking(bookingId: string): Promise<unknown> {
  const res = await ApiService.post<BookingEnvelope<unknown>>(
    endpoints.bookings.cancel(bookingId),
  );
  return unbox(res.data);
}
