import { describe, expect, it } from 'vitest';

import {
  bookingActionsFor,
  dateRange,
  draftFromSlots,
  draftToInput,
  validateSlotDraft,
  type SlotDraftRow,
} from '@/features/website-bookings/slot-draft';

function row(startTime: string, endTime: string): SlotDraftRow {
  return {
    key: startTime,
    startTime,
    endTime,
    available: true,
    locked: false,
    bookingStatus: null,
  };
}

describe('validateSlotDraft', () => {
  it('accepts sorted, non-overlapping HH:MM slots', () => {
    expect(validateSlotDraft([row('10:00', '10:30'), row('10:30', '11:00')])).toBeNull();
  });

  it('rejects bad times, inverted ranges and overlaps', () => {
    expect(validateSlotDraft([row('9:00', '10:00')])).toMatch(/HH:MM/);
    expect(validateSlotDraft([row('11:00', '10:00')])).toMatch(/start before/);
    expect(validateSlotDraft([row('10:30', '11:00'), row('10:00', '10:45')])).toMatch(/overlap/);
  });
});

describe('slot draft mapping', () => {
  it('locks slots that hold a live booking and emits a sorted body', () => {
    const rows = draftFromSlots([
      {
        slotDate: '2026-11-10',
        startTime: '11:00',
        endTime: '11:30',
        available: true,
        bookingId: 'b1',
        bookingStatus: 'CONFIRMED',
      },
      {
        slotDate: '2026-11-10',
        startTime: '10:00',
        endTime: '10:30',
        available: false,
        bookingId: 'b0',
        bookingStatus: 'CANCELLED',
      },
    ]);
    expect(rows.map((r) => r.locked)).toEqual([true, false]);
    expect(draftToInput(rows)).toEqual([
      { startTime: '10:00', endTime: '10:30', available: false },
      { startTime: '11:00', endTime: '11:30', available: true },
    ]);
  });

  it('offers only the server-allowed moves', () => {
    expect(bookingActionsFor('PENDING')).toEqual(['confirm', 'cancel']);
    expect(bookingActionsFor('CONFIRMED')).toEqual(['complete', 'cancel']);
    expect(bookingActionsFor('COMPLETED')).toEqual([]);
  });

  it('builds a date range across a month boundary', () => {
    expect(dateRange('2026-11-29', 3)).toEqual(['2026-11-29', '2026-11-30', '2026-12-01']);
  });
});
