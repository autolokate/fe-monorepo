import type {
  AdminTaxiBookingDetailDto,
  AdminTaxiBookingSummaryDto,
  AdminTaxiCheckoutDto,
  AdminTaxiMoneyOutcomeDto,
  AdminTaxiMoneySideDto,
} from '@autolokate/api-client';

import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime, formatPaise } from '@/platform/utils/format-admin-date';

/**
 * Taxi money rules v2 — display helpers. Every amount, bps and deadline comes from the server; these
 * helpers only format. Never hardcode a percentage or a window here.
 */

export const TAXI_BOOKING_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_ADVANCE', label: 'Awaiting booking fee' },
  { value: 'PENDING_PARTNER_DEPOSIT', label: 'Awaiting deposit' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DISPUTED', label: 'Disputed' },
  { value: 'NO_SHOW_CUSTOMER', label: 'No-show (customer)' },
  { value: 'NO_SHOW_PARTNER', label: 'No-show (partner)' },
  { value: 'CANCELLED_CUSTOMER', label: 'Cancelled (customer)' },
  { value: 'CANCELLED_PARTNER', label: 'Cancelled (partner)' },
  { value: 'CANCELLED_ADMIN', label: 'Cancelled (admin)' },
  { value: 'EXPIRED', label: 'Expired' },
] as const;

export const TAXI_ENROLLMENT_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REVOKED', label: 'Revoked' },
] as const;

export const TAXI_REVENUE_KIND_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ADVANCE_EARNED', label: 'Booking fee earned' },
  { value: 'ADVANCE_FORFEITED', label: 'Booking fee forfeited' },
  { value: 'DEPOSIT_FORFEITED', label: 'Deposit forfeited' },
] as const;

const BOOKING_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  TAXI_BOOKING_STATUS_FILTERS.filter((f) => f.value !== 'ALL').map((f) => [f.value, f.label]),
);

/** Known statuses get operator copy; an unknown (newer) status still renders, humanized. */
export function taxiBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status] ?? humanizeAdminLabel(status);
}

const CANCEL_CODE_LABELS: Record<string, string> = {
  CUSTOMER_CANCEL: 'Customer cancelled',
  PARTNER_CANCEL: 'Partner cancelled',
  ADMIN_CANCEL: 'Operator cancelled',
  DEPOSIT_TIMEOUT: 'Partner deposit not paid in time',
  ADVANCE_TIMEOUT: 'Booking fee not paid in time',
  DISPUTE_NO_FAULT: 'Dispute closed — no fault',
};

export function taxiCancelCodeLabel(code: string | null | undefined): string {
  if (!code) return '—';
  return CANCEL_CODE_LABELS[code] ?? humanizeAdminLabel(code);
}

/** Statuses the server lets an operator cancel (BE `ADMIN_CANCELLABLE`). */
const ADMIN_CANCELLABLE = new Set([
  'PENDING_ADVANCE',
  'PENDING_PARTNER_DEPOSIT',
  'CONFIRMED',
  'IN_PROGRESS',
  'DISPUTED',
]);

export function bookingCancelBlockedReason(status: string): string | null {
  if (ADMIN_CANCELLABLE.has(status)) return null;
  return `Booking is ${taxiBookingStatusLabel(status).toLowerCase()} — only open, confirmed, in-progress or disputed bookings can be cancelled.`;
}

export function disputeResolveBlockedReason(status: string): string | null {
  return status === 'DISPUTED' ? null : 'Only a disputed booking can be resolved.';
}

type BookingRow = AdminTaxiBookingSummaryDto | AdminTaxiBookingDetailDto;

/** Latest checkout of a kind, preferring one the provider captured (server amounts + bps). */
function checkoutOf(
  row: BookingRow,
  kind: AdminTaxiCheckoutDto['kind'],
): AdminTaxiCheckoutDto | null {
  const checkouts = 'checkouts' in row ? row.checkouts.filter((c) => c.kind === kind) : [];
  if (checkouts.length === 0) return null;
  const sorted = [...checkouts].sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  return sorted.find((c) => c.status === 'PAID') ?? sorted[0] ?? null;
}

/** Customer booking fee: the v2 `advance` block when present, else the legacy status + checkout. */
export function customerAdvanceOf(row: BookingRow): AdminTaxiMoneySideDto | null {
  if (row.advance) {
    return {
      status: row.advance.status,
      amountPaise: row.advance.amountPaise,
      bps: row.advance.bps,
    };
  }
  const checkout = checkoutOf(row, 'CUSTOMER_ADVANCE');
  if (!row.customerAdvanceStatus) return null;
  return {
    status: row.customerAdvanceStatus,
    amountPaise: checkout?.amountPaise ?? null,
    bps: checkout?.customerAdvanceBpsSnapshot ?? null,
  };
}

/** Partner deposit: the v2 `deposit` block when present, else the legacy status + checkout. */
export function partnerDepositOf(row: BookingRow): AdminTaxiMoneySideDto | null {
  if (row.deposit) {
    return {
      status: row.deposit.status,
      amountPaise: row.deposit.amountPaise,
      bps: row.deposit.bps,
    };
  }
  const checkout = checkoutOf(row, 'PARTNER_DEPOSIT');
  if (!row.partnerDepositStatus) return null;
  return {
    status: row.partnerDepositStatus,
    amountPaise: checkout?.amountPaise ?? null,
    bps: checkout?.partnerDepositBpsSnapshot ?? null,
  };
}

/** Server amount + status; percent only when the server reported the bps. */
export function formatMoneySide(value: AdminTaxiMoneySideDto | null): string {
  if (!value) return '—';
  const parts = [humanizeAdminLabel(value.status)];
  if (typeof value.amountPaise === 'number') parts.push(formatPaise(value.amountPaise));
  if (typeof value.bps === 'number') parts.push(`${(value.bps / 100).toString()}%`);
  return parts.join(' · ');
}

/** Status on which the server will return a deposit now (HELD, or legacy RELEASE_PENDING_PAYOUT). */
const RELEASABLE_DEPOSIT = new Set(['HELD', 'RELEASE_PENDING_PAYOUT']);

/** Mirrors the server rule: return only a held deposit on a COMPLETED trip. */
export function depositReleaseBlockedReason(row: BookingRow): string | null {
  if (row.status !== 'COMPLETED') {
    return `Booking is ${taxiBookingStatusLabel(row.status).toLowerCase()} — a deposit is returned early only on a completed trip.`;
  }
  const deposit = row.deposit?.status ?? row.partnerDepositStatus;
  if (!deposit || deposit === 'NONE') return 'No partner deposit recorded for this booking.';
  if (RELEASABLE_DEPOSIT.has(deposit)) return null;
  return `Deposit is ${humanizeAdminLabel(deposit)} — only a held deposit can be returned.`;
}

/** "Held" sides — what the admin-cancel choices actually apply to (others are ignored server-side). */
export function holdsMoney(side: AdminTaxiMoneySideDto | null): boolean {
  return side?.status === 'HELD';
}

const ADVANCE_DECISION: Record<string, string> = {
  REFUND: 'refunded to the customer',
  FORFEIT: 'forfeited (Autolokate revenue)',
  EARN: 'earned (Autolokate revenue)',
  NONE: 'unchanged',
};
const DEPOSIT_DECISION: Record<string, string> = {
  RELEASE: 'returned to the partner',
  FORFEIT: 'forfeited (Autolokate revenue)',
  NONE: 'unchanged',
};

/** One line per money side for the outcome an action returned. */
export function describeMoneyOutcome(outcome: AdminTaxiMoneyOutcomeDto): string[] {
  const line = (label: string, decision: string, amount: number, map: Record<string, string>) =>
    decision === 'NONE'
      ? `${label}: no money held — unchanged.`
      : `${label}: ${formatPaise(amount)} ${map[decision] ?? humanizeAdminLabel(decision)}.`;
  return [
    line('Booking fee', outcome.advance.decision, outcome.advance.amountPaise, ADVANCE_DECISION),
    line(
      'Partner deposit',
      outcome.deposit.decision,
      outcome.deposit.amountPaise,
      DEPOSIT_DECISION,
    ),
  ];
}

/** "until 3 Nov, 14:00 (refundable now)" style copy for the advance refund window. */
export function describeRefundWindow(row: BookingRow): string {
  const until = row.advance?.refundableUntil;
  if (!until) return '—';
  return `${formatAdminDateTime(until)}${row.advance?.refundable ? ' (refundable now)' : ' (passed)'}`;
}

export const TAXI_REVENUE_KIND_LABELS: Record<string, string> = Object.fromEntries(
  TAXI_REVENUE_KIND_FILTERS.filter((f) => f.value !== 'ALL').map((f) => [f.value, f.label]),
);
