/** Normalised time slot suitable for both UI rendering and the booking payload. */
export type ExpertTimeSlot = {
  slotStartTime: string;
  slotEndTime: string;
  label: string;
};

/** Booking type values accepted by `POST /v1/bookings/book`. */
export type BookingType =
  | "founder_call"
  | "test_drive"
  | "service_appointment"
  | "consultation";

/** Normalised "my bookings" row used by the history table. */
export type UserBookingSummary = {
  id: string;
  status: string;
  slotDate: string;
  slotStartLabel: string;
  slotEndLabel: string;
  meetLink?: string | null;
  raw: Record<string, unknown>;
};

/** Parsed `POST /v1/payments/orders` response ready for Razorpay Checkout. */
export type ParsedPaymentOrder = {
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
};

/** Receipt persisted in sessionStorage after a verified payment. */
export type StoredConsultReceipt = {
  ok: true;
  provider: "razorpay";
  name: string;
  phone: string;
  date: string;
  time: string;
  amountInr: number;
  currency: string;
  reference: string;
  customerEmail: string | null;
  paidAt: string;
  meetLink?: string | null;
};
