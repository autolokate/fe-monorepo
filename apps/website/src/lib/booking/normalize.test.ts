import { beforeEach, describe, expect, it } from 'vitest';

import { saveSession } from '@/lib/session';
import { createBooking, getBookingSlotsByDate } from '@/services/booking';
import { envelope, installFakeFetch, resetWebsiteSession } from '@/test/fake-fetch';

import {
  bookingStatusLabel,
  canCancelBooking,
  isSlotUnavailableError,
  normalizeMyBookings,
  normalizeSlotsForDate,
} from './normalize';

beforeEach(() => {
  resetWebsiteSession();
  saveSession({
    accessToken: 'a',
    refreshToken: 'r',
    expiresAt: '2099-01-01T00:00:00.000Z',
    userId: 'u',
  });
});

describe('booking slots (WEB-03)', () => {
  it('reads GET /v1/booking-slots/{date} (not the old /v1/bookings/slots)', async () => {
    const fake = installFakeFetch();
    fake.on('GET', '/v1/booking-slots/2026-11-20', {
      status: 200,
      body: envelope([
        {
          slot_date: '2026-11-20',
          slot_start_time: '14:00',
          slot_end_time: '14:15',
          available: true,
        },
      ]),
    });
    const rows = await getBookingSlotsByDate('2026-11-20');
    expect(rows).toHaveLength(1);
    expect(fake.calls[0]?.headers.authorization).toBe('Bearer a');
  });

  it('normalises the Nest slot DTO (HH:mm) and keeps unavailable slots disabled', () => {
    const slots = normalizeSlotsForDate(
      [
        {
          slot_date: '2026-11-20',
          slot_start_time: '14:00',
          slot_end_time: '14:15',
          available: false,
        },
        {
          slot_date: '2026-11-20',
          slot_start_time: '09:30',
          slot_end_time: '09:45',
          available: true,
        },
        {
          slot_date: '2026-11-21',
          slot_start_time: '10:00',
          slot_end_time: '10:15',
          available: true,
        },
        { slot_date: '2026-11-20', slot_start_time: 'bad', slot_end_time: '10:15' },
      ],
      '2026-11-20',
    );
    expect(slots).toEqual([
      {
        slotDate: '2026-11-20',
        slotStartTime: '09:30',
        slotEndTime: '09:45',
        label: '9:30 AM – 9:45 AM',
        available: true,
      },
      {
        slotDate: '2026-11-20',
        slotStartTime: '14:00',
        slotEndTime: '14:15',
        label: '2:00 PM – 2:15 PM',
        available: false,
      },
    ]);
  });

  it('books with the exact DTO fields and no payment call', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/bookings/book', {
      status: 201,
      body: envelope({ id: 'b1', status: 'PENDING' }),
    });
    await createBooking({
      slot_date: '2026-11-20',
      slot_start_time: '09:30',
      slot_end_time: '09:45',
      booking_type: 'founder_call',
    });
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]?.body).toEqual({
      slot_date: '2026-11-20',
      slot_start_time: '09:30',
      slot_end_time: '09:45',
      booking_type: 'founder_call',
    });
  });

  it('shows server status verbatim-mapped and never upgrades PENDING', () => {
    const [row] = normalizeMyBookings([
      {
        id: 'b1',
        status: 'PENDING',
        slot_date: '2026-11-20',
        slot_start_time: '09:30',
        slot_end_time: '09:45',
      },
    ]);
    expect(bookingStatusLabel(row.status)).toBe('Requested');
    expect(row.slotStartLabel).toBe('9:30 AM');
    expect(canCancelBooking(row)).toBe(true);
    expect(canCancelBooking({ ...row, status: 'COMPLETED' })).toBe(false);
  });

  it('recognises 409 slot_unavailable from POST /v1/bookings/book', async () => {
    const fake = installFakeFetch();
    fake.on('POST', '/v1/bookings/book', {
      status: 409,
      body: { error: { code: 'slot_unavailable', message: 'Slot is already booked.' } },
    });
    const error = await createBooking({
      slot_date: '2026-11-20',
      slot_start_time: '09:30',
      slot_end_time: '09:45',
      booking_type: 'founder_call',
    }).catch((e: unknown) => e);
    expect(isSlotUnavailableError(error)).toBe(true);
    expect(isSlotUnavailableError(new Error('boom'))).toBe(false);
  });
});
