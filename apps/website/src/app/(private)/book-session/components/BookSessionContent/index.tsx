'use client';

import { useCallback, useState } from 'react';

import { useCurrentUser, useIsAuthenticated } from '@/hooks/auth';
import { useCancelBooking, useMyBookings } from '@/hooks/booking';
import type { UserBookingSummary } from '@/lib/booking/types';

import { HeroBanner } from '../HeroBanner';
import { WhyBook } from '../WhyBook';
import { FounderCard } from '../FounderCard';
import { SessionDetails } from '../SessionDetails';
import { HowItWorks } from '../HowItWorks';
import { Faq } from '../Faq';
import { BookingForm } from '../BookingForm';
import { BookingHistoryMini } from '../BookingHistoryMini';
import { CancelDialog } from '../CancelDialog';

/**
 * Top-level client wrapper for `/book-session`. Owns the auth state, the
 * bookings list, and the cancel dialog. Each sub-section is a self-contained
 * folder under `components/` so they can be edited or replaced in isolation.
 */
export function BookSessionContent() {
  const authed = useIsAuthenticated();
  const userQuery = useCurrentUser({ enabled: authed === true });
  const bookingsQuery = useMyBookings({ enabled: authed === true });

  const [cancelTarget, setCancelTarget] = useState<UserBookingSummary | null>(null);

  const cancelMutation = useCancelBooking({
    onSuccess: async () => {
      setCancelTarget(null);
      await bookingsQuery.refetch();
    },
  });

  const handlePaymentSettled = useCallback(() => {
    void bookingsQuery.refetch();
  }, [bookingsQuery]);

  const handleConfirmCancel = useCallback(() => {
    if (!cancelTarget) return;
    void cancelMutation.mutate(cancelTarget.id);
  }, [cancelTarget, cancelMutation]);

  return (
    <div className="antialiased">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_90%_at_50%_-25%,rgba(24,24,27,0.05),transparent_58%)]" />
      </div>

      <main className="relative">
        <HeroBanner />
        <WhyBook />
        <FounderCard />

        {/* Main content + booking sidebar */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10">
            {/* Right (sticky) sidebar */}
            <aside
              className="order-1 min-w-0 lg:order-2 lg:col-span-5 lg:flex lg:min-h-0 lg:flex-col lg:self-start lg:sticky lg:top-16"
              aria-labelledby="book-session-title"
            >
              <h2 id="book-session-title" className="sr-only">
                Reserve and pay for your session
              </h2>
              <div className="flex flex-col gap-4">
                <BookingForm
                  authed={authed}
                  user={userQuery.data ?? null}
                  onPaymentSettled={handlePaymentSettled}
                />
                {authed === true && (
                  <BookingHistoryMini
                    bookings={bookingsQuery.bookings}
                    isLoading={bookingsQuery.isLoading}
                    onRequestCancel={setCancelTarget}
                    cancellingId={cancelMutation.isLoading ? (cancelTarget?.id ?? null) : null}
                  />
                )}
              </div>
            </aside>

            {/* Left column: marketing content */}
            <article
              className="order-2 min-w-0 lg:order-1 lg:col-span-7"
              aria-label="What to expect from your expert session"
            >
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:p-8">
                <SessionDetails />
                <div className="my-8 h-px bg-border sm:my-9" role="presentation" />
                <HowItWorks />
                <div className="my-8 h-px bg-border sm:my-9" role="presentation" />
                <Faq />
                <p className="mt-8 rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  Autolokate expert sessions are guidance only — not financial, legal, or insurance
                  advice. See checkout for reschedule and refund terms.
                </p>
              </div>
            </article>
          </div>
        </div>
      </main>

      <CancelDialog
        target={cancelTarget}
        onClose={() => {
          setCancelTarget(null);
        }}
        onConfirm={handleConfirmCancel}
        loading={cancelMutation.isLoading}
      />
    </div>
  );
}
