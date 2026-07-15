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
  promoCode?: string;
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

export interface OrderTracking {
  orderId: string;
  orderKind: OrderKind;
  status: OrderStatus;
  totalPaise: number;
  paymentOutcome?: PaymentOutcome;
  fulfillment?: OrderFulfillment | null;
}

/** A row in the buyer's order history (`GET /v1/orders`). */
export interface OrderSummary {
  orderId: string;
  orderKind: OrderKind;
  status: OrderStatus;
  totalPaise: number;
  createdAt: string;
  planName: string;
  fulfillment?: OrderFulfillment | null;
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
