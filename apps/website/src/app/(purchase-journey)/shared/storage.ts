'use client';

/**
 * Cross-page purchase-journey state, persisted in localStorage. Each page reads
 * what it needs and writes its own slice, so the flow survives refreshes and
 * hard navigations between the separate journey routes.
 */
const STORAGE_KEY = 'autolokate:purchase-journey';

export interface JourneyState {
  /** Selected plan id (UUID) — keeps the Back link to verify alive on cart-keyed routes. */
  planId?: string;
  /** Selected plan tier ("SECURE" | "SHIELD" | "SHIELD_PLUS"). */
  planTier?: string;
  /** Number of add-on riders chosen on the configure step (0 = solo). */
  riderCount?: number;
  /** Cart minted after verify — the address + review steps are keyed by it. */
  cartId?: string;
  /** Chosen saved-address id — sent as `addressId` on order create. */
  addressId?: string;
  /** Order created on the review step — used to poll the payment outcome. */
  orderId?: string;
  /** Razorpay payment reference from the pay call — shown as the txn id on success. */
  paymentRef?: string;
  /** Path the buyer arrived from, so we can send them back on exit. */
  from?: string;
}

export function readJourneyState(): JourneyState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JourneyState) : {};
  } catch {
    return {};
  }
}

export function patchJourneyState(patch: JourneyState): void {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...readJourneyState(), ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}
