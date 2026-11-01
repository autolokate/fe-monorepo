/**
 * Expert-session booking (website domain). Mirrors the Nest DTOs in
 * be-monorepo `packages/domains/website/src/http/v1/dto/booking.dto.ts`:
 * slots/bookings carry `slot_date` (yyyy-MM-dd) + `slot_start_time`/`slot_end_time`
 * (HH:mm, IST wall-clock). There is NO payment step on the backend for sessions.
 */

/** Normalised time slot suitable for both UI rendering and the booking payload. */
export type ExpertTimeSlot = {
  /** yyyy-MM-dd */
  slotDate: string;
  /** HH:mm — sent back verbatim on `POST /v1/bookings/book`. */
  slotStartTime: string;
  /** HH:mm */
  slotEndTime: string;
  /** Display label, e.g. "10:00 AM – 10:15 AM". */
  label: string;
  /** False when ops closed the slot or another booking holds it. */
  available: boolean;
};

/** `booking_type` is opaque to Nest; the website books founder calls. */
export type BookingType = 'founder_call';

/** Server booking lifecycle (`WebsiteBookingDto.status`). */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/** Normalised "my bookings" row used by the history table. */
export type UserBookingSummary = {
  id: string;
  /** Server status, verbatim (unknown values pass through as-is). */
  status: string;
  slotDate: string;
  slotStartLabel: string;
  slotEndLabel: string;
  raw: Record<string, unknown>;
};
