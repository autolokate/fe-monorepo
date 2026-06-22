"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError, extractApiErrorMessage } from "@/lib/api/error";
import {
  bookingIdFromCreateResponse,
  meetLinkFromVerify,
  parsePaymentOrderResponse,
} from "@/lib/booking/normalize";
import {
  ensureRazorpayScript,
  extractRazorpayFailureMessage,
  type RazorpayHandlerResponse,
} from "@/lib/booking/razorpay";
import { storeConsultReceipt } from "@/lib/booking/receipt-storage";
import type { ExpertTimeSlot } from "@/lib/booking/types";
import { createBooking } from "@/services/booking";
import { createPaymentOrder, verifyPayment } from "@/services/payment";

export interface BookSessionInput {
  name: string;
  phone: string;
  slot: ExpertTimeSlot;
  /** yyyy-MM-dd — must match `slot.slotStartTime.slice(0, 10)`. */
  slotDate: string;
}

export interface ResumePaymentInput {
  bookingId: string;
  name: string;
  phone: string;
  slotDate: string;
  timeLabel: string;
}

function amountInrFromOrder(parsed: { amountPaise: number }): number {
  return Math.round(parsed.amountPaise / 100);
}

function newIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}`;
}

interface OpenCheckoutArgs {
  orderRaw: unknown;
  name: string;
  phone: string;
  slotDate: string;
  timeLabel: string;
  redirectTo: string;
}

async function openRazorpayCheckout(args: OpenCheckoutArgs): Promise<void> {
  const { orderRaw, name, phone, slotDate, timeLabel, redirectTo } = args;
  const parsed = parsePaymentOrderResponse(orderRaw);
  const publicKey =
    parsed.keyId ||
    (typeof process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "string"
      ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      : "");

  if (!parsed.razorpayOrderId || !publicKey || !parsed.amountPaise) {
    toast.error("Could not start payment. Try again in a moment.");
    return;
  }

  const scriptOk = await ensureRazorpayScript();
  if (!scriptOk || !window.Razorpay) {
    toast.error("Could not load Razorpay. Check your connection.");
    return;
  }

  await new Promise<void>((resolve) => {
    // Latch — `payment.failed` and `ondismiss` can both fire for the same
    // attempt. We only want the first one to settle the promise / show UI.
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const rzp = new window.Razorpay!({
      key: publicKey,
      amount: parsed.amountPaise,
      currency: parsed.currency || "INR",
      name: "Autolokate",
      description: "15-minute expert session",
      order_id: parsed.razorpayOrderId,
      prefill: { name: name.trim(), contact: phone.trim() },
      modal: { ondismiss: () => settle() },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          const verified = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          const meetLink = meetLinkFromVerify(verified);

          storeConsultReceipt({
            ok: true,
            provider: "razorpay",
            name: name.trim(),
            phone: phone.trim(),
            date: slotDate,
            time: timeLabel,
            amountInr: amountInrFromOrder(parsed),
            currency: parsed.currency || "INR",
            reference: response.razorpay_payment_id,
            customerEmail: null,
            paidAt: new Date().toISOString(),
            meetLink,
          });

          toast.success("Payment received. Your session is confirmed.");
          window.location.assign(redirectTo);
        } catch (err) {
          const msg =
            err instanceof ApiError ? err.message : extractApiErrorMessage(err);
          toast.error(msg || "Payment verification failed.");
        } finally {
          settle();
        }
      },
    });

    // Razorpay calls `payment.failed` for card declines, wrong OTP,
    // insufficient funds, network drops, etc. `handler` does NOT fire in
    // these cases, so without this listener the modal would close silently.
    rzp.on("payment.failed", (raw: unknown) => {
      toast.error(extractRazorpayFailureMessage(raw));
      settle();
    });

    rzp.open();
  });
}

export interface UseBookSessionOptions {
  /** Page to navigate to after a verified payment. Defaults to `/book-session`. */
  redirectTo?: string;
  /** Called after the Razorpay modal closes (success, error, or dismiss). */
  onSettled?: () => void | Promise<void>;
}

/**
 * Full "book + pay" flow:
 * 1. POST /v1/bookings/book to reserve the slot.
 * 2. POST /v1/payments/orders to mint a Razorpay order.
 * 3. Open Razorpay Checkout; on `handler`, POST /v1/payments/verify.
 * 4. Persist a local receipt and redirect.
 *
 * Also returns `completePaymentForBooking` for "Complete payment" on a
 * pending-payment booking (skips the booking create step).
 */
export function useBookSession(options: UseBookSessionOptions = {}) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const redirectTo = options.redirectTo ?? "/book-session";

  const pay = useCallback(
    async ({ name, phone, slot, slotDate }: BookSessionInput) => {
      setPaying(true);
      try {
        const bookingRaw = await createBooking({
          slot_date: slotDate,
          slot_start_time: slot.slotStartTime,
          slot_end_time: slot.slotEndTime,
          booking_type: "founder_call",
        });

        const bookingId = bookingIdFromCreateResponse(bookingRaw);
        if (!bookingId) {
          toast.error("Could not create booking. Please try another slot.");
          return;
        }

        const orderRaw = await createPaymentOrder(
          bookingId,
          newIdempotencyKey(`idem-${bookingId}`),
        );

        await openRazorpayCheckout({
          orderRaw,
          name: name.trim(),
          phone: phone.trim(),
          slotDate,
          timeLabel: slot.label,
          redirectTo,
        });
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : extractApiErrorMessage(err);
        toast.error(msg || "Something went wrong. Please try again.");
      } finally {
        setPaying(false);
        await options.onSettled?.();
      }
    },
    [redirectTo, options],
  );

  const completePaymentForBooking = useCallback(
    async ({ bookingId, name, phone, slotDate, timeLabel }: ResumePaymentInput) => {
      setPaying(true);
      try {
        const orderRaw = await createPaymentOrder(
          bookingId,
          newIdempotencyKey(`resume-${bookingId}`),
        );
        await openRazorpayCheckout({
          orderRaw,
          name,
          phone,
          slotDate,
          timeLabel,
          redirectTo,
        });
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : extractApiErrorMessage(err);
        toast.error(msg || "Could not resume payment.");
      } finally {
        setPaying(false);
        await options.onSettled?.();
      }
    },
    [redirectTo, options],
  );

  return { pay, completePaymentForBooking, paying, router };
}
