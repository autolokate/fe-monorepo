import { isValid, parseISO } from "date-fns";
import type {
  ExpertTimeSlot,
  ParsedPaymentOrder,
  UserBookingSummary,
} from "./types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** Format an ISO start string into a user-friendly IST label (e.g. "3:00 PM"). */
export function formatSlotLabel(isoStart: string): string {
  const d = parseISO(isoStart);
  if (!isValid(d)) return isoStart;
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function slotFromUnknown(row: unknown): ExpertTimeSlot | null {
  const o = asRecord(row);
  if (!o) return null;
  const start =
    (typeof o.slot_start_time === "string" && o.slot_start_time) ||
    (typeof o.start_time === "string" && o.start_time) ||
    (typeof o.start === "string" && o.start) ||
    "";
  const end =
    (typeof o.slot_end_time === "string" && o.slot_end_time) ||
    (typeof o.end_time === "string" && o.end_time) ||
    (typeof o.end === "string" && o.end) ||
    "";
  if (!start || !end) return null;
  const s = parseISO(start);
  const e = parseISO(end);
  if (!isValid(s) || !isValid(e)) return null;
  return { slotStartTime: start, slotEndTime: end, label: formatSlotLabel(start) };
}

function dedupeSlots(slots: ExpertTimeSlot[]): ExpertTimeSlot[] {
  const seen = new Set<string>();
  const out: ExpertTimeSlot[] = [];
  for (const s of slots) {
    const k = `${s.slotStartTime}|${s.slotEndTime}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

/**
 * Normalise GET /v1/bookings/slots or /slots/{date} payloads into the slot
 * buttons for a single calendar day. Handles array, envelope, and grouped
 * (`{ slots: [...] }`) shapes.
 */
export function normalizeSlotsForDate(raw: unknown, yyyyMmDd: string): ExpertTimeSlot[] {
  const rows: unknown[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const day = asRecord(item);
      if (day && Array.isArray(day.slots)) rows.push(...day.slots);
      else rows.push(item);
    }
  } else {
    const top = asRecord(raw);
    const data = top?.data ?? raw;
    if (Array.isArray(data)) {
      for (const item of data) {
        const day = asRecord(item);
        if (day && Array.isArray(day.slots)) rows.push(...day.slots);
        else rows.push(item);
      }
    } else if (Array.isArray((top as { slots?: unknown[] })?.slots)) {
      rows.push(...(top as { slots: unknown[] }).slots);
    }
  }

  const dayPrefix = yyyyMmDd.trim();
  const slots: ExpertTimeSlot[] = [];
  for (const item of rows) {
    const slot = slotFromUnknown(item);
    if (!slot) continue;
    if (slot.slotStartTime.slice(0, 10) !== dayPrefix) continue;
    slots.push(slot);
  }
  slots.sort((a, b) => a.slotStartTime.localeCompare(b.slotStartTime));
  return dedupeSlots(slots);
}

/** Normalise POST /v1/payments/orders for Razorpay Checkout. */
export function parsePaymentOrderResponse(raw: unknown): ParsedPaymentOrder {
  const top = asRecord(raw) ?? {};
  const data = asRecord(top.data) ?? top;
  const razorpayOrderId = String(
    data.razorpay_order_id ?? data.order_id ?? data.id ?? data.razorpayOrderId ?? "",
  );
  const amountRaw = data.amount ?? data.amount_paise ?? data.amount_in_paise;
  const amountPaise = typeof amountRaw === "number" ? amountRaw : Number(amountRaw ?? 0);
  const currency = String(data.currency ?? "INR");
  const keyId = String(
    data.key_id ?? data.razorpay_key_id ?? data.public_key_id ?? data.keyId ?? "",
  );
  return {
    razorpayOrderId,
    amountPaise: Number.isFinite(amountPaise) ? amountPaise : 0,
    currency,
    keyId,
  };
}

function formatBookingTime(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return iso;
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

/** Normalise GET /v1/bookings/my into the rows shown by the history table. */
export function normalizeMyBookings(raw: unknown): UserBookingSummary[] {
  const list = Array.isArray(raw)
    ? raw
    : ((asRecord(raw)?.data as unknown[] | undefined) ?? []);
  if (!Array.isArray(list)) return [];

  const out: UserBookingSummary[] = [];
  for (const item of list) {
    const o = asRecord(item);
    if (!o) continue;
    const id = String(o.id ?? o.booking_id ?? "");
    if (!id) continue;
    const status = String(o.status ?? o.booking_status ?? "unknown");
    const slotDate = String(o.slot_date ?? o.slotDate ?? "").slice(0, 10);
    const startIso = String(o.slot_start_time ?? o.slotStartTime ?? "");
    const endIso = String(o.slot_end_time ?? o.slotEndTime ?? "");
    const meetLink =
      typeof o.google_meet_link === "string" && o.google_meet_link
        ? o.google_meet_link
        : typeof o.meet_link === "string"
          ? o.meet_link
          : typeof o.meeting_link === "string"
            ? o.meeting_link
            : typeof o.google_meet_url === "string"
              ? o.google_meet_url
              : null;
    out.push({
      id,
      status,
      slotDate,
      slotStartLabel: startIso ? formatBookingTime(startIso) : "—",
      slotEndLabel: endIso ? formatBookingTime(endIso) : "—",
      meetLink,
      raw: o,
    });
  }
  return out;
}

const normStatus = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "_");

/** A booking that should prevent the user from creating a new one. */
export function bookingIsBlockingNewRequest(b: UserBookingSummary): boolean {
  const s = normStatus(b.status);
  if (s.includes("cancel")) return false;
  if (s.includes("complete") || s.includes("done")) return false;
  if (s.includes("fail") || s.includes("expired")) return false;
  return true;
}

export function isPendingPaymentBooking(b: UserBookingSummary): boolean {
  return normStatus(b.status) === "pending_payment";
}

export function canCancelBooking(b: UserBookingSummary): boolean {
  const s = normStatus(b.status);
  if (s.includes("cancel")) return false;
  if (s.includes("complete") || s.includes("done")) return false;
  return true;
}

/** Pull a booking id out of `POST /v1/bookings/book` regardless of envelope shape. */
export function bookingIdFromCreateResponse(raw: unknown): string {
  const o = asRecord(raw) ?? {};
  const nested =
    asRecord(o.data) ?? asRecord(o.booking) ?? asRecord(o.result) ?? o;
  const id = nested.id ?? nested.booking_id ?? o.booking_id;
  return typeof id === "string" ? id : String(id ?? "");
}

/** Pick a Meet URL out of `POST /v1/payments/verify`, if the backend returned one. */
export function meetLinkFromVerify(raw: unknown): string | null {
  const o = asRecord(raw) ?? {};
  const nested = asRecord(o.data) ?? o;
  const link =
    (typeof nested.google_meet_link === "string" && nested.google_meet_link) ||
    (typeof nested.meet_link === "string" && nested.meet_link) ||
    (typeof nested.meeting_url === "string" && nested.meeting_url) ||
    (typeof nested.google_meet_url === "string" && nested.google_meet_url) ||
    null;
  return link;
}
