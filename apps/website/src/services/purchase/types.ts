/** Money is always in paise across the purchase backend. */

export interface CreateCartPayload {
  /** Plan UUID from `GET /v1/plans` (retail sends planId, omits `code`). */
  planId: string;
  /** Number of riders / vehicles to cover. */
  riderCount: number;
  /** Optional promo applied at the order-summary step. */
  promoCode?: string;
}

/** Body for `PATCH /v1/cart/:cartId` — re-price an existing cart in place. */
export interface UpdateCartPayload {
  /** The cart minted by the initial `POST /v1/cart`. */
  cartId: string;
  planId: string;
  riderCount: number;
  /**
   * A non-empty string applies/re-applies that promo; `null` explicitly clears
   * an applied promo (sent to the backend as `promoCode: null`); `undefined`
   * leaves the cart's current promo untouched.
   */
  promoCode?: string | null;
  /** Optional vehicle registration to attach to the cart. */
  registration?: string;
}

export interface Cart {
  cartId: string;
  planPricePaise: number;
  riderCoverPaise: number;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedPromoCode?: string | null;
  expiresAt: string;
}

export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface CreateOrderPayload {
  cartId: string;
  /** A SAVED address id (`GET/POST /v1/addresses`) — where to ship. Required. */
  addressId: string;
}

export interface Order {
  orderId: string;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedPromoCode?: string | null;
  status: OrderStatus;
}

export interface PayOrderPayload {
  /** Set up an auto-renew mandate. `false` for a one-time payment. */
  setupMandate: boolean;
  /** The DPDP mandate consent. */
  mandateConsent: boolean;
}

export interface PaymentRef {
  paymentRef: string;
  providerOrderId?: string | null;
  razorpayKeyId?: string | null;
}

export type PaymentOutcome = 'PENDING' | 'UNCONFIRMED' | 'PAID' | 'FAILED' | 'REFUNDED';

/**
 * `GET /v1/retail/orders/:id/payment`. Nest answers `{ outcome }` only — it has no buyer
 * order number or gateway transaction ref for retail orders yet, so those stay optional and
 * the UI falls back to the order id (what Admin looks orders up by). Never fabricate them.
 */
export interface PaymentOutcomeResult {
  outcome: PaymentOutcome;
  orderNumber?: string | null;
  totalPaise?: number | null;
  /** The gateway's transaction number (`pay_XXXX`), when a backend reports it. */
  transactionRef?: string | null;
}

export type OrderKind = 'SCAN_SELF_PAY' | 'RETAIL_SHIP' | 'UPGRADE' | 'RENEWAL';

export type FulfillmentStatus =
  | 'PAID'
  | 'ALLOCATED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

/** A single stage change in the shipment's lifecycle. */
export interface FulfillmentEvent {
  status: FulfillmentStatus;
  /** Courier-supplied label (e.g. "AWB assigned · Blue Dart Surface"). */
  rawStatus?: string | null;
  occurredAt: string;
}

export interface OrderFulfillment {
  status?: FulfillmentStatus;
  courier?: string | null;
  awbNo?: string | null;
  trackingUrl?: string | null;
  maskedPincode?: string | null;
  allocatedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  /** Ordered stage history, oldest first. */
  events?: FulfillmentEvent[];
}

/** `GET /v1/retail/orders/:id` (`WebsiteRetailOrderDetailDto`). */
export interface OrderTracking {
  orderId: string;
  orderKind: OrderKind;
  status: OrderStatus;
  totalPaise: number;
  /** Plan the cart priced; null if that plan row no longer exists. */
  planName?: string | null;
  /** Rider covers pinned on the order at checkout (0–2). */
  riderCount?: number;
  /** GST-inclusive rider cover pinned at checkout, already inside `totalPaise`. */
  riderCoverPaise?: number;
  paymentOutcome?: PaymentOutcome;
  /** Null until a shipment ledger exists on the backend — no stage is invented. */
  fulfillment?: OrderFulfillment | null;
  createdAt?: string;
}

/** A row in the buyer's order history (`GET /v1/retail/orders`, same shape as the detail). */
export interface OrderSummary extends OrderTracking {
  /** A buyer-facing number, when a backend issues one. Nest retail does not yet. */
  orderNumber?: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  taxableValuePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
  amountPaidPaise: number;
  status: string;
  paymentTerms?: string | null;
  dueDate?: string | null;
  issuedAt?: string | null;
  paidAt?: string | null;
  /** Pre-signed URL to the generated invoice PDF. */
  downloadUrl?: string | null;
}
