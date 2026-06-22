"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, IndianRupee, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useBookingSlots, useBookSession } from "@/hooks/booking";
import type { ExpertTimeSlot } from "@/lib/booking/types";
import type { AuthUser } from "@/services/auth/types";

import { SESSION_FEE } from "../../constants";
import { BookSessionCalendar } from "../BookSessionCalendar";
import { FORM_LABEL, INPUT_BASE, INPUT_LIGHT } from "./constants";

const digitsOnly = (s: string) => s.replace(/\D/g, "");

export interface BookingFormProps {
  /** Resolved auth state. `null` = still hydrating. */
  authed: boolean | null;
  /** Current user (used to prefill name + phone when present). */
  user?: AuthUser | null;
  /** Called after the Razorpay modal closes so callers can refresh bookings. */
  onPaymentSettled?: () => void;
}

/**
 * Sidebar form: name + phone + date + time slot → Razorpay checkout.
 * Marketing content stays visible when not signed in, but the form is
 * disabled and a "Sign in required" CTA replaces the pay button.
 */
export function BookingForm({ authed, user, onPaymentSettled }: BookingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<ExpertTimeSlot | null>(null);

  const { pay, paying } = useBookSession({ onSettled: onPaymentSettled });
  const slotsQuery = useBookingSlots({
    date,
    enabled: authed === true,
  });

  // Reset selected slot whenever the date changes or the slot list refreshes.
  useEffect(() => {
    setSelectedSlot(null);
  }, [date]);

  // Prefill from user once it lands; never overwrite a value the user has typed.
  useEffect(() => {
    if (!user) return;
    setName((prev) => prev.trim() || (user.full_name ? String(user.full_name) : ""));
    setPhone((prev) => prev.trim() || (user.phone ? String(user.phone) : ""));
  }, [user]);

  const effectiveName = name.trim() || (user?.full_name ? String(user.full_name) : "");
  const effectivePhone = phone.trim() || (user?.phone ? String(user.phone) : "");
  const phoneDigits = digitsOnly(phone).length;

  const contactReady = Boolean(
    authed === true &&
      effectiveName.length > 0 &&
      digitsOnly(effectivePhone).length >= 10,
  );
  const ready = Boolean(contactReady && date && selectedSlot);

  const inputCls = cn(INPUT_BASE, INPUT_LIGHT);

  const handlePay = async () => {
    if (!ready || !selectedSlot) return;
    await pay({
      name: effectiveName,
      phone: effectivePhone,
      slot: selectedSlot,
      slotDate: date,
    });
  };

  return (
    <div
      id="book-session"
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Header */}
      <div className="relative shrink-0 border-b border-border bg-muted/30 px-4 py-3.5 sm:px-5">
        <div className="relative flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">
              Reserve a slot
            </p>
            <ul className="mt-2 space-y-1.5">
              {["15 min expert call", "Email recap after the call"].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs leading-snug text-muted-foreground"
                >
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-right sm:px-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary sm:text-xs">
              From
            </p>
            <p className="font-display text-2xl font-bold tabular-nums leading-none text-foreground sm:text-[1.75rem]">
              ₹{SESSION_FEE}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Final total at Razorpay · GST incl.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {authed === false && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-snug text-amber-800 sm:text-[0.8125rem]">
            <p className="font-semibold text-amber-900">Sign in required</p>
            <p className="mt-1.5 text-amber-700">
              Bookings are tied to your account. Sign in with OTP to see live slots
              and pay.
            </p>
            <Button
              variant="default"
              className="mt-3 h-10 w-full text-sm font-semibold"
              asChild
            >
              <Link href="/auth/login">
                <LogIn className="h-4 w-4" aria-hidden />
                Sign in
              </Link>
            </Button>
          </div>
        )}

        {/* Name + Phone */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="bs-name" className={FORM_LABEL}>
              Full name <span className="text-destructive">*</span>
            </label>
            <input
              id="bs-name"
              placeholder="Name on ID"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              autoComplete="name"
              disabled={authed !== true}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="bs-phone" className={FORM_LABEL}>
              Mobile <span className="text-destructive">*</span>
            </label>
            <input
              id="bs-phone"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              autoComplete="tel"
              disabled={authed !== true}
            />
          </div>
        </div>

        {phone.length > 0 && phoneDigits < 10 && (
          <p className="text-xs text-amber-500">
            At least 10 digits (or leave blank to use account phone).
          </p>
        )}
        {authed === true && user?.phone && !phone.trim() && (
          <p className="text-xs text-muted-foreground/70">
            Using phone from your account for checkout.
          </p>
        )}

        {/* Date */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Choose a date <span className="text-destructive">*</span>
          </p>
          <BookSessionCalendar
            compact
            value={date}
            onChange={setDate}
            disabled={authed !== true}
          />
        </div>

        {/* Time slots */}
        <div className="space-y-1.5">
          <p
            id="bs-time-label"
            className="text-xs font-semibold uppercase tracking-wide text-foreground/70"
          >
            Time (IST) <span className="text-destructive">*</span>
          </p>

          {authed !== true ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              Sign in to load available slots from the server.
            </p>
          ) : !date ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              Pick a date first.
            </p>
          ) : slotsQuery.isLoading || slotsQuery.isFetching ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
              Loading slots…
            </div>
          ) : slotsQuery.isError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              {slotsQuery.error?.message ?? "Could not load slots."}
            </p>
          ) : slotsQuery.slots.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              No open slots on this day — try another date.
            </p>
          ) : (
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="group"
              aria-labelledby="bs-time-label"
            >
              {slotsQuery.slots.map((slot) => {
                const active =
                  selectedSlot?.slotStartTime === slot.slotStartTime &&
                  selectedSlot?.slotEndTime === slot.slotEndTime;
                return (
                  <button
                    key={`${slot.slotStartTime}|${slot.slotEndTime}`}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "min-h-10 rounded-lg border px-1.5 py-2 text-center text-xs font-semibold leading-tight transition-all",
                      active
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border bg-muted text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    {slot.label.replace(" ", "\u00A0")}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-xs leading-snug text-muted-foreground/70">
          Slots update in real-time. We may message you before the call.
        </p>

        <Button
          variant="default"
          className="h-11 w-full gap-2 text-sm font-semibold"
          disabled={!ready || paying || authed !== true}
          onClick={handlePay}
        >
          {paying ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Opening checkout…
            </>
          ) : (
            <>
              <IndianRupee className="h-3.5 w-3.5" />
              Pay
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground/70">
          Advice only · See terms at checkout
        </p>
      </div>
    </div>
  );
}
