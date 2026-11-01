import type {
  AdminTaxiBookingDetailDto,
  AdminTaxiBookingSummaryDto,
  AdminTaxiCheckoutDto,
  AdminTaxiMoneySideDto,
} from '@autolokate/api-client';

import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatPaise } from '@/platform/utils/format-admin-date';

export const TAXI_BOOKING_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_ADVANCE', label: 'Awaiting advance' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED_CUSTOMER', label: 'Cancelled (customer)' },
  { value: 'CANCELLED_PARTNER', label: 'Cancelled (partner)' },
  { value: 'CANCELLED_ADMIN', label: 'Cancelled (admin)' },
  { value: 'DISPUTED', label: 'Disputed' },
] as const;

export const TAXI_ENROLLMENT_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REVOKED', label: 'Revoked' },
] as const;

/** Statuses the server lets an operator cancel (BE `ADMIN_CANCELLABLE`). */
const ADMIN_CANCELLABLE = new Set(['PENDING_ADVANCE', 'CONFIRMED', 'IN_PROGRESS']);

export function bookingCancelBlockedReason(status: string): string | null {
  if (ADMIN_CANCELLABLE.has(status)) return null;
  return `Booking is ${humanizeAdminLabel(status)} — only awaiting-advance, confirmed or in-progress bookings can be cancelled.`;
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

function side(
  status: string | null | undefined,
  checkout: AdminTaxiCheckoutDto | null,
  bps: number | null,
): AdminTaxiMoneySideDto | null {
  if (!status) return null;
  return { status, amountPaise: checkout?.amountPaise ?? null, bps: checkout ? bps : null };
}

export function customerAdvanceOf(row: BookingRow): AdminTaxiMoneySideDto | null {
  const checkout = checkoutOf(row, 'CUSTOMER_ADVANCE');
  return side(row.customerAdvanceStatus, checkout, checkout?.customerAdvanceBpsSnapshot ?? null);
}

export function partnerDepositOf(row: BookingRow): AdminTaxiMoneySideDto | null {
  const checkout = checkoutOf(row, 'PARTNER_DEPOSIT');
  return side(row.partnerDepositStatus, checkout, checkout?.partnerDepositBpsSnapshot ?? null);
}

/** Server amount + status; percent only when the server reported the bps snapshot. */
export function formatMoneySide(value: AdminTaxiMoneySideDto | null): string {
  if (!value) return '—';
  const parts = [humanizeAdminLabel(value.status)];
  if (typeof value.amountPaise === 'number') parts.push(formatPaise(value.amountPaise));
  if (typeof value.bps === 'number') parts.push(`${(value.bps / 100).toString()}%`);
  return parts.join(' · ');
}

/** Mirrors the server rule: release only a HELD deposit on a COMPLETED trip. */
export function depositReleaseBlockedReason(row: BookingRow): string | null {
  if (row.status !== 'COMPLETED') {
    return `Booking is ${humanizeAdminLabel(row.status)} — a deposit is released only after the trip completes.`;
  }
  const deposit = row.partnerDepositStatus;
  if (!deposit || deposit === 'NONE') return 'No partner deposit recorded for this booking.';
  if (deposit === 'HELD') return null;
  return `Deposit is ${humanizeAdminLabel(deposit)} — only a held deposit can be released.`;
}
