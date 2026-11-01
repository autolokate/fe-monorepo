import type { BookingStatus, ExpertTimeSlot, UserBookingSummary } from './types';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function toStr(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  return fallback;
}

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** "14:30" → "2:30 PM". Unknown shapes are returned unchanged. */
export function formatClock(hhmm: string): string {
  const m = HH_MM.exec(hhmm.trim());
  if (!m) return hhmm;
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12)}:${m[2]} ${suffix}`;
}

/** "2026-10-20" → "Tue, 20 Oct". */
export function formatSlotDate(ymd: string): string {
  if (!YMD.test(ymd)) return ymd;
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function slotFromUnknown(row: unknown, fallbackDate: string): ExpertTimeSlot | null {
  const o = asRecord(row);
  if (!o) return null;
  const start = toStr(o.slot_start_time).trim();
  const end = toStr(o.slot_end_time).trim();
  const date = toStr(o.slot_date, fallbackDate).trim();
  if (!HH_MM.test(start) || !HH_MM.test(end) || !YMD.test(date)) return null;
  return {
    slotDate: date,
    slotStartTime: start,
    slotEndTime: end,
    label: `${formatClock(start)} – ${formatClock(end)}`,
    available: o.available !== false,
  };
}

/**
 * Normalise `GET /v1/booking-slots/{date}` (`WebsiteBookingSlotDto[]`) into the slot
 * buttons for one day. Only slots the server published for that date are returned —
 * nothing is invented. Unavailable slots are kept (rendered disabled).
 */
export function normalizeSlotsForDate(raw: unknown, yyyyMmDd: string): ExpertTimeSlot[] {
  const list = Array.isArray(raw) ? raw : asRecord(raw)?.data;
  if (!Array.isArray(list)) return [];
  const day = yyyyMmDd.trim();
  const seen = new Set<string>();
  const slots: ExpertTimeSlot[] = [];
  for (const item of list) {
    const slot = slotFromUnknown(item, day);
    if (slot?.slotDate !== day) continue;
    const key = `${slot.slotStartTime}|${slot.slotEndTime}`;
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push(slot);
  }
  slots.sort((a, b) => a.slotStartTime.localeCompare(b.slotStartTime));
  return slots;
}

/** Normalise `GET /v1/bookings/my` (`WebsiteBookingDto[]`) into history rows. */
export function normalizeMyBookings(raw: unknown): UserBookingSummary[] {
  const list = Array.isArray(raw) ? raw : asRecord(raw)?.data;
  if (!Array.isArray(list)) return [];
  const out: UserBookingSummary[] = [];
  for (const item of list) {
    const o = asRecord(item);
    if (!o) continue;
    const id = toStr(o.id);
    if (!id) continue;
    const start = toStr(o.slot_start_time);
    const end = toStr(o.slot_end_time);
    out.push({
      id,
      status: toStr(o.status, 'UNKNOWN'),
      slotDate: toStr(o.slot_date).slice(0, 10),
      slotStartLabel: start ? formatClock(start) : '—',
      slotEndLabel: end ? formatClock(end) : '—',
      raw: o,
    });
  }
  return out;
}

const norm = (s: string) => s.trim().toUpperCase();

/** Human label for a server status — the UI never upgrades a booking's state. */
export function bookingStatusLabel(status: string): string {
  switch (norm(status) as BookingStatus) {
    case 'PENDING':
      return 'Requested';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
}

/** The backend lets a consumer cancel PENDING or CONFIRMED bookings only. */
export function canCancelBooking(b: UserBookingSummary): boolean {
  const s = norm(b.status);
  return s === 'PENDING' || s === 'CONFIRMED';
}

/** Pull the booking id out of `POST /v1/bookings/book`. */
export function bookingIdFromCreateResponse(raw: unknown): string {
  const o = asRecord(raw) ?? {};
  const nested = asRecord(o.data) ?? o;
  return toStr(nested.id);
}

/** Friendly copy for `POST /v1/bookings/book` 409 `slot_unavailable` (taken or closed meanwhile). */
export const SLOT_UNAVAILABLE_MESSAGE =
  'Sorry — that slot was just taken or closed. Please pick another time.';

/** True when a booking attempt failed because the slot is no longer bookable. */
export function isSlotUnavailableError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'slot_unavailable'
  );
}
