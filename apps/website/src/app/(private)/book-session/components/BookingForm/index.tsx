'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Loader2, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useBookingSlots, useBookSession } from '@/hooks/booking';
import type { ExpertTimeSlot } from '@/lib/booking/types';

import { BOOK_SESSION_ROUTE } from '../../constants';
import { BookSessionCalendar } from '../BookSessionCalendar';

export interface BookingFormProps {
  /** Resolved auth state. `null` = still hydrating. */
  authed: boolean | null;
  /** Called after a booking request settles so callers can refresh the history. */
  onBooked?: () => void;
}

const SIGN_IN_HREF = `/auth/login?next=${encodeURIComponent(BOOK_SESSION_ROUTE)}`;

/**
 * Sidebar form: date + published slot → `POST /v1/bookings/book`.
 * Bookings are tied to the signed-in account (no name/phone fields — the backend takes
 * neither). There is no online payment for sessions on the backend, so the form only
 * creates a request; its status is whatever the server reports in "Your bookings".
 */
export function BookingForm({ authed, onBooked }: BookingFormProps) {
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ExpertTimeSlot | null>(null);

  const slotsQuery = useBookingSlots({ date, enabled: authed === true });
  const { book, submitting } = useBookSession({
    onSettled: onBooked,
    onSlotUnavailable: () => {
      setSelectedSlot(null);
      void slotsQuery.refetch();
    },
  });

  useEffect(() => {
    setSelectedSlot(null);
  }, [date]);

  const ready = authed === true && Boolean(date && selectedSlot?.available);

  const handleBook = async () => {
    if (!ready || !selectedSlot) return;
    const id = await book({ slot: selectedSlot });
    if (id) {
      setSelectedSlot(null);
      void slotsQuery.refetch();
    }
  };

  return (
    <div
      id="book-session"
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-3.5 sm:px-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">
          Request a slot
        </p>
        <ul className="mt-2 space-y-1.5">
          {['15 min expert call', 'Tied to your Autolokate account'].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-xs leading-snug text-muted-foreground"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {authed === false && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-snug text-amber-800 sm:text-[0.8125rem]">
            <p className="font-semibold text-amber-900">Sign in required</p>
            <p className="mt-1.5 text-amber-700">
              Bookings are tied to your account. Sign in with OTP to see available slots.
            </p>
            <Button variant="default" className="mt-3 h-10 w-full text-sm font-semibold" asChild>
              <Link href={SIGN_IN_HREF}>
                <LogIn className="h-4 w-4" aria-hidden />
                Sign in
              </Link>
            </Button>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Choose a date <span className="text-destructive">*</span>
          </p>
          <BookSessionCalendar compact value={date} onChange={setDate} disabled={authed !== true} />
        </div>

        <div className="space-y-1.5">
          <p
            id="bs-time-label"
            className="text-xs font-semibold uppercase tracking-wide text-foreground/70"
          >
            Time (IST) <span className="text-destructive">*</span>
          </p>

          {authed !== true ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              Sign in to load available slots.
            </p>
          ) : !date ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              Pick a date first.
            </p>
          ) : slotsQuery.isLoading || slotsQuery.isFetching ? (
            <div
              className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-3 text-xs text-muted-foreground"
              role="status"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
              Loading slots…
            </div>
          ) : slotsQuery.isError ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700"
              role="alert"
            >
              <p>{slotsQuery.error?.message ?? 'Could not load slots.'}</p>
              <button
                type="button"
                className="mt-1.5 font-semibold underline underline-offset-2"
                onClick={() => void slotsQuery.refetch()}
              >
                Try again
              </button>
            </div>
          ) : slotsQuery.slots.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              No slots published for this day — try another date.
            </p>
          ) : (
            <div
              className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2"
              role="group"
              aria-labelledby="bs-time-label"
            >
              {slotsQuery.slots.map((slot) => {
                const active =
                  selectedSlot?.slotStartTime === slot.slotStartTime &&
                  selectedSlot.slotEndTime === slot.slotEndTime;
                return (
                  <button
                    key={`${slot.slotStartTime}|${slot.slotEndTime}`}
                    type="button"
                    disabled={!slot.available}
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedSlot(slot);
                    }}
                    className={cn(
                      'min-h-10 rounded-lg border px-1.5 py-2 text-center text-xs font-semibold leading-tight transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:line-through',
                      active
                        ? 'border-primary/50 bg-primary/15 text-primary'
                        : 'border-border bg-muted text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {slot.label}
                    {!slot.available ? <span className="sr-only"> (unavailable)</span> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button
          variant="default"
          className="h-11 w-full gap-2 text-sm font-semibold"
          disabled={!ready || submitting}
          onClick={() => {
            void handleBook();
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Requesting…
            </>
          ) : (
            <>
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
              Request this slot
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground/80">
          No payment is taken online. Your request shows as “Requested” until our team confirms it.
        </p>
      </div>
    </div>
  );
}
