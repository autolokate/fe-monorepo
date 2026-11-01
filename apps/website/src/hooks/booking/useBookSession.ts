'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { extractApiErrorMessage } from '@/lib/api/error';
import { bookingIdFromCreateResponse } from '@/lib/booking/normalize';
import type { ExpertTimeSlot } from '@/lib/booking/types';
import { createBooking } from '@/services/booking';

export interface BookSessionInput {
  slot: ExpertTimeSlot;
}

export interface UseBookSessionOptions {
  /** Called after the request settles (success or error) so callers can refetch bookings. */
  onSettled?: () => void | Promise<void>;
}

/**
 * Request an expert session: `POST /v1/bookings/book`.
 *
 * WEB-03: the backend has no payment route for website sessions (no `/v1/payments/*`, and
 * bookings are not linked to retail orders), so the old "Razorpay → verify → confirmed"
 * step was removed. The booking is created as PENDING and the UI shows exactly the status
 * the server returns — it never claims a booking is paid or confirmed.
 */
export function useBookSession(options: UseBookSessionOptions = {}) {
  const [submitting, setSubmitting] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const book = useCallback(async ({ slot }: BookSessionInput): Promise<string | null> => {
    setSubmitting(true);
    try {
      const raw = await createBooking({
        slot_date: slot.slotDate,
        slot_start_time: slot.slotStartTime,
        slot_end_time: slot.slotEndTime,
        booking_type: 'founder_call',
      });
      const id = bookingIdFromCreateResponse(raw);
      if (!id) {
        toast.error('Could not create the booking. Please try another slot.');
        return null;
      }
      toast.success('Slot requested. Track its status under “Your bookings”.');
      return id;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Could not book this slot. Please try again.'));
      return null;
    } finally {
      setSubmitting(false);
      await optionsRef.current.onSettled?.();
    }
  }, []);

  return { book, submitting };
}
