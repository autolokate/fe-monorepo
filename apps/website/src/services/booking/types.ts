import type { BookingType } from '@/lib/booking/types';

/** Body for `POST /v1/bookings/book` — mirrors the Nest `CreateWebsiteBookingDto`. */
export interface CreateBookingPayload {
  /** yyyy-MM-dd */
  slot_date: string;
  /** HH:mm */
  slot_start_time: string;
  /** HH:mm */
  slot_end_time: string;
  booking_type: BookingType;
  car_profile_id?: string;
}

export interface BookingSlotsQuery {
  /** yyyy-MM-dd. When provided, range defaults to one day. */
  date?: string;
  /** 1–31 days ahead. */
  range_days?: number;
}
