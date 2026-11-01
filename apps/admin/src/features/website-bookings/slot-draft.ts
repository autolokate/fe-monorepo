import type {
  AdminBookingSlotDto,
  AdminBookingSlotInput,
  AdminWebsiteBookingAction,
  AdminWebsiteBookingStatus,
} from '@autolokate/api-client';

/** One editable row in the day editor. `locked` rows hold a live booking: times can't change. */
export type SlotDraftRow = {
  key: string;
  startTime: string;
  endTime: string;
  available: boolean;
  locked: boolean;
  bookingStatus: AdminWebsiteBookingStatus | null;
};

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A booking that still holds its slot (the server refuses to remove such a slot). */
export function isLiveBooking(status: AdminWebsiteBookingStatus | null): boolean {
  return status === 'PENDING' || status === 'CONFIRMED';
}

export function draftFromSlots(slots: readonly AdminBookingSlotDto[]): SlotDraftRow[] {
  return slots.map((slot) => ({
    key: `${slot.startTime}-${slot.endTime}`,
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: slot.available,
    locked: isLiveBooking(slot.bookingStatus),
    bookingStatus: slot.bookingStatus,
  }));
}

/**
 * Client-side mirror of the server's publish rules (HH:MM, start before end, no overlaps, ≤ 96 slots)
 * so the operator sees the problem before the round trip. Returns the first problem, or null.
 */
export function validateSlotDraft(rows: readonly SlotDraftRow[]): string | null {
  if (rows.length > 96) {
    return 'A day can have at most 96 slots.';
  }
  for (const row of rows) {
    if (!HHMM.test(row.startTime) || !HHMM.test(row.endTime)) {
      return `Use HH:MM (24h) times — check ${row.startTime || '?'}–${row.endTime || '?'}.`;
    }
    if (row.startTime >= row.endTime) {
      return `Slot ${row.startTime}–${row.endTime} must start before it ends.`;
    }
  }
  const sorted = [...rows].sort((a, b) => a.startTime.localeCompare(b.startTime));
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev && cur && cur.startTime < prev.endTime) {
      return `Slots overlap: ${prev.startTime}–${prev.endTime} and ${cur.startTime}–${cur.endTime}.`;
    }
  }
  return null;
}

export function draftToInput(rows: readonly SlotDraftRow[]): AdminBookingSlotInput[] {
  return [...rows]
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((row) => ({ startTime: row.startTime, endTime: row.endTime, available: row.available }));
}

/** Operator moves allowed from each status (server: PENDING→CONFIRMED|CANCELLED, CONFIRMED→COMPLETED|CANCELLED). */
export function bookingActionsFor(
  status: AdminWebsiteBookingStatus,
): readonly AdminWebsiteBookingAction[] {
  if (status === 'PENDING') return ['confirm', 'cancel'];
  if (status === 'CONFIRMED') return ['complete', 'cancel'];
  return [];
}

/** `YYYY-MM-DD` for a Date in the operator's local calendar. */
export function toYmd(date: Date): string {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** The `days` consecutive dates starting at `from` (YYYY-MM-DD). */
export function dateRange(from: string, days: number): string[] {
  const [y, m, d] = from.split('-').map(Number);
  const start = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  return Array.from({ length: days }, (_, i) =>
    toYmd(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)),
  );
}
