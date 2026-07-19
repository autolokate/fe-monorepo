'use client';

/**
 * Thin journey facade over the shared purchase cart + address services, so the
 * checkout pages import from one co-located module. The underlying calls are the
 * exact same ones the old `(purchase)` flow uses — only the timing differs: the
 * new journey mints the cart right after verify (so the address route can be
 * keyed by `cartId`), instead of on the summary step.
 */

import {
  createCart,
  updateCart,
  createOrder,
  payOrder,
  getOrderPayment,
  getPurchaseSession,
  type Cart,
  type Order,
  type PaymentRef,
  type PaymentOutcome,
  type UpdateCartPayload,
} from '@/services/purchase';

export type { Cart, Order, PaymentRef, PaymentOutcome } from '@/services/purchase';
export {
  ADDRESS_MIN_QUERY,
  isPurchaseAuthenticated,
  type SavedAddress,
  type CreateAddressPayload,
  type UpdateAddressPayload,
  type AddressSuggestion,
  type ResolvedAddress,
} from '@/services/purchase';

/**
 * `POST /v1/cart` — mint the priced cart for the chosen plan + riders. Called
 * right after the buyer verifies (to key the `/checkout/:cartId` routes), and
 * again on a payment retry to mint a fresh cart (the previous one is consumed by
 * its order). Pass `promoCode` to carry an applied discount onto the new cart.
 */
export function createJourneyCart(
  planId: string,
  riderCount: number,
  promoCode?: string,
): Promise<Cart> {
  return createCart({ planId, riderCount, promoCode });
}

/**
 * `PATCH /v1/cart/:cartId` — re-price the existing cart in place. The review
 * step uses this both as its "load" (there's no GET cart) and to (re)apply or
 * clear a promo. Returns the full priced {@link Cart} (all paise fields).
 */
export function updateJourneyCart(payload: UpdateCartPayload): Promise<Cart> {
  return updateCart(payload);
}

/** `POST /v1/orders` — turn the priced cart + chosen address into an order. */
export function createJourneyOrder(cartId: string, addressId: string): Promise<Order> {
  return createOrder({ cartId, addressId });
}

/**
 * `POST /v1/orders/:id/pay` — start payment for an order. Auto-renew is always
 * set up for the retail journey, so the mandate + consent are sent as `true`.
 * The response carries the Razorpay key + provider order id for checkout.
 */
export function payJourneyOrder(orderId: string): Promise<PaymentRef> {
  return payOrder(orderId, { setupMandate: true, mandateConsent: true });
}

/**
 * `GET /v1/orders/:id/payment` — the authoritative payment outcome
 * (webhook-driven). The read also carries the buyer-facing order number and the
 * gateway's transaction ref; callers that need those take the whole
 * `getOrderPayment` response instead of this outcome-only narrowing.
 */
export function getJourneyPaymentOutcome(orderId: string): Promise<PaymentOutcome> {
  return getOrderPayment(orderId).then((payment) => payment.outcome);
}

/** The 10-digit login number from the live purchase session, for form prefill. */
export function getSessionMobile(): string {
  const phone = getPurchaseSession()?.phone;
  if (phone?.startsWith('+91')) return phone.slice(3);
  return '';
}
