import type { ApiEnvelope } from "@/services/auth/types";
import type { BookingType } from "@/lib/booking/types";

/** Body for `POST /v1/bookings/book` — mirrors the backend `CreateBookingDto`. */
export interface CreateBookingPayload {
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  booking_type: BookingType;
  /** Optional — required only for test-drive style bookings. */
  car_profile_id?: string;
}

export interface BookingSlotsQuery {
  /** ISO yyyy-MM-dd. When provided, range defaults to one day. */
  date?: string;
  /** How many days ahead the backend should scan. */
  range_days?: number;
}

/** All booking endpoints return either the raw resource or a `{ success, data }` envelope. */
export type BookingEnvelope<T> = ApiEnvelope<T>;
