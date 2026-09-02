import { Shield, ShieldCheck, ShieldPlus } from 'lucide-react';
import { PLAN_DISPLAY_BY_SLUG } from '@/lib/plan-display-names';
import type {
  PayMethod,
  PurchasePlan,
  PurchasePlanId,
  PurchasePricing,
  PurchaseStep,
} from './types';

/** Route the pricing / home plan cards point at. */
export const PURCHASE_ROUTE = '/purchase';

export const MOBILE_LENGTH = 10;
/** The backend sends a 6-digit code (matches the auth flow). */
export const OTP_LENGTH = 6;
export const PIN_LENGTH = 6;
export const MAX_QTY = 9;

/** Applied automatically once the buyer protects two or more vehicles. */
export const MULTI_VEHICLE_DISCOUNT = 0.1;
/** GST is inclusive; we back it out only to show the split on the invoice line. */
export const GST_RATE = 0.18;

export const PURCHASE_PLANS: PurchasePlan[] = [
  {
    id: 'secure',
    name: PLAN_DISPLAY_BY_SLUG.secure,
    tag: 'The essentials',
    price: 999,
    Icon: ShieldCheck,
    features: ['Smart QR protection', 'Emergency contacts', 'Parking help', 'Service history'],
  },
  {
    id: 'shield',
    name: PLAN_DISPLAY_BY_SLUG.shield,
    tag: 'Full crash protection',
    price: 1999,
    Icon: Shield,
    popular: true,
    popularBadge: 'Most Popular · 7 in 10 choose this',
    features: [
      `Everything in ${PLAN_DISPLAY_BY_SLUG.secure}`,
      'Automatic crash detection',
      'Family alerts + live location',
      'Roadside assistance tools',
      'Priority support',
    ],
  },
  {
    id: 'shield-plus',
    name: PLAN_DISPLAY_BY_SLUG['shield-plus'],
    tag: 'Whole-family cover',
    price: 2999,
    Icon: ShieldPlus,
    features: [
      `Everything in ${PLAN_DISPLAY_BY_SLUG.shield}`,
      'Family safety circle',
      'Advanced alerts',
      'Resale & transfer support',
    ],
  },
];

export const PAY_METHODS: { id: PayMethod; label: string }[] = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'netbanking', label: 'Netbanking' },
];

/** Progress rail shown for the pre-delivery purchase screens. */
export const STEPPER_LABELS = ['Plan', 'Verify', 'Address', 'Pay', 'Done'] as const;

/** Maps a flow step to its index on the progress rail (PWA screens reuse the last). */
export const STEP_TO_STEPPER_INDEX: Record<PurchaseStep, number> = {
  plans: 0,
  configure: 0,
  login: 1,
  address: 2,
  summary: 3,
  success: 4,
  tracking: 4,
  scan: 4,
  plate: 4,
  contacts: 4,
  active: 4,
};

/** Steps that belong to the post-delivery PWA activation sub-flow. */
export const PWA_STEPS: PurchaseStep[] = ['scan', 'plate', 'contacts', 'active'];

export const TRACKING_STEPS = [
  {
    title: 'Order confirmed',
    desc: 'Payment received · GST invoice emailed',
    state: 'done' as const,
  },
  {
    title: 'QR code allocated',
    desc: 'Your unique vehicle QR is reserved and printed',
    state: 'done' as const,
  },
  {
    title: 'Shipped via Shiprocket',
    desc: 'AWB SR-77120394 · left our facility today',
    state: 'done' as const,
  },
  {
    title: 'In transit',
    desc: 'With the courier — arriving Thu, 16 Jul',
    state: 'active' as const,
  },
  {
    title: 'Delivered → ready to activate',
    desc: 'QR becomes scannable · activate in the app',
    state: 'pending' as const,
  },
];

/** Purchase-flow slug → backend tier code (matches the plans API). */
export const PLAN_ID_TO_TIER: Record<PurchasePlanId, string> = {
  secure: 'SECURE',
  shield: 'SHIELD',
  'shield-plus': 'SHIELD_PLUS',
};

/** Paise → "1,999" (whole rupees, Indian grouping, no symbol). */
export function paiseToInr(paise: number): string {
  return formatInr(Math.round(paise / 100));
}

export function getPlan(planId: PurchasePlanId): PurchasePlan {
  return PURCHASE_PLANS.find((p) => p.id === planId) ?? PURCHASE_PLANS[1];
}

export function isPurchasePlanId(value: string | null): value is PurchasePlanId {
  return value === 'secure' || value === 'shield' || value === 'shield-plus';
}

/**
 * Only trust internal, same-origin paths for the "back to where I came from"
 * redirect. Anything else falls back to the pricing page.
 */
export function pickSafeOrigin(from: string | null): string {
  if (from && from.startsWith('/') && !from.startsWith('//')) return from;
  return '/pricing';
}

/** Indian-format currency without the symbol (e.g. 1,999). */
export function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN');
}

export function computePricing(price: number, qty: number): PurchasePricing {
  const subtotal = price * qty;
  const multiDiscount = qty >= 2;
  const discountAmount = multiDiscount ? Math.round(subtotal * MULTI_VEHICLE_DISCOUNT) : 0;
  const total = subtotal - discountAmount;
  const gstIncluded = Math.round(total - total / (1 + GST_RATE));

  return { subtotal, multiDiscount, discountAmount, total, gstIncluded };
}
