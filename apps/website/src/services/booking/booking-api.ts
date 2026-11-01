'use client';

import { http } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { BookingSlotsQuery, CreateBookingPayload } from './types';

interface Enveloped<T> {
  data?: T;
}

/** GET /v1/booking-slots — published slots for `date` + `range_days` (CONSUMER bearer). */
export async function getBookingSlots(query: BookingSlotsQuery = {}): Promise<unknown[]> {
  const res = await http.get<Enveloped<unknown[]>>(endpoints.bookings.slots, {
    params: { date: query.date, range_days: query.range_days },
  });
  return res.data.data ?? [];
}

/** GET /v1/booking-slots/{yyyy-MM-dd} — published slots for one day (empty when none). */
export async function getBookingSlotsByDate(dateIso: string): Promise<unknown[]> {
  const res = await http.get<Enveloped<unknown[]>>(endpoints.bookings.slotsByDate(dateIso));
  return res.data.data ?? [];
}

/**
 * POST /v1/bookings/book — reserves the slot. The server creates the booking as PENDING;
 * there is no payment endpoint for sessions, so nothing here charges the user.
 */
export async function createBooking(payload: CreateBookingPayload): Promise<unknown> {
  const body: Record<string, unknown> = {
    slot_date: payload.slot_date,
    slot_start_time: payload.slot_start_time,
    slot_end_time: payload.slot_end_time,
    booking_type: payload.booking_type,
  };
  if (payload.car_profile_id) body.car_profile_id = payload.car_profile_id;
  const res = await http.post<Enveloped<unknown>>(endpoints.bookings.create, body);
  return res.data.data;
}

/** GET /v1/bookings/my — the signed-in account's bookings. */
export async function getMyBookings(): Promise<unknown[]> {
  const res = await http.get<Enveloped<unknown[]>>(endpoints.bookings.my);
  return res.data.data ?? [];
}

/** GET /v1/bookings/{id}. */
export async function getBookingById(bookingId: string): Promise<unknown> {
  const res = await http.get<Enveloped<unknown>>(endpoints.bookings.byId(bookingId));
  return res.data.data;
}

/** POST /v1/bookings/{id}/cancel (PENDING or CONFIRMED only). */
export async function cancelBooking(bookingId: string): Promise<unknown> {
  const res = await http.post<Enveloped<unknown>>(endpoints.bookings.cancel(bookingId));
  return res.data.data;
}
