/**
 * Canonical paths for the pages of the purchase journey. These live in the
 * `(purchase-journey)` route group, so the folder name is not part of the URL.
 */
export const JOURNEY_ROUTES = {
  buy: '/buy',
  /** Configure step for a specific plan, keyed by plan id (e.g. /buy/<uuid>). */
  configure: (planId: string) => `/buy/${planId}`,
  /** Verify (mobile + OTP) step. */
  verify: (planId: string) => `/buy/${planId}/verify`,
  /** Address step — keyed by the cart minted after verify (e.g. /checkout/<cartId>/address). */
  address: (cartId: string) => `/checkout/${cartId}/address`,
  /** Review + pay step (next after address). */
  review: (cartId: string) => `/checkout/${cartId}/review`,
  /** Buyer's order history ("My orders"). */
  orders: '/orders',
  /** Buyer's saved delivery addresses ("My addresses"). */
  addresses: '/addresses',
  /** Add-address modal/page. */
  addressNew: '/addresses/new',
  /** Edit-address modal/page, keyed by the saved address id. */
  addressEdit: (addressId: string) => `/addresses/${addressId}/edit`,
  /** Post-payment status (confirming → success/failed), keyed by the order id. */
  orderStatus: (orderNo: string) => `/orders/${orderNo}`,
  /** Shipment tracking timeline for a paid order. */
  orderTrack: (orderNo: string) => `/orders/${orderNo}/track`,
} as const;
