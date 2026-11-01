import type { AdminTaxiBookingSummaryDto, AdminTaxiMoneySideDto } from '@autolokate/api-client';

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
  { value: 'DISPUTED', label: 'Disputed' },
] as const;

export const TAXI_ENROLLMENT_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REVOKED', label: 'Revoked' },
] as const;

/** Booking statuses after which the trip has started or ended — cancel is not offered. */
const NOT_CANCELLABLE = new Set([
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED_CUSTOMER',
  'CANCELLED_PARTNER',
  'NO_SHOW_CUSTOMER',
  'NO_SHOW_PARTNER',
]);

export function bookingCancelBlockedReason(status: string): string | null {
  if (status === 'IN_PROGRESS')
    return 'Trip already started — cancel is only allowed before pickup.';
  if (NOT_CANCELLABLE.has(status)) return `Booking is ${humanizeAdminLabel(status)}.`;
  return null;
}

function side(
  nested: AdminTaxiMoneySideDto | null | undefined,
  flatStatus: string | null | undefined,
): AdminTaxiMoneySideDto | null {
  if (nested) return nested;
  if (flatStatus) return { status: flatStatus, amountPaise: null, bps: null };
  return null;
}

export function customerAdvanceOf(row: AdminTaxiBookingSummaryDto): AdminTaxiMoneySideDto | null {
  return side(row.customerAdvance, row.customerAdvanceStatus);
}

export function partnerDepositOf(row: AdminTaxiBookingSummaryDto): AdminTaxiMoneySideDto | null {
  return side(row.partnerDeposit, row.partnerDepositStatus);
}

/** Server amount + status; percent only when the server reported the bps snapshot. */
export function formatMoneySide(value: AdminTaxiMoneySideDto | null): string {
  if (!value) return '—';
  const parts = [humanizeAdminLabel(value.status)];
  if (typeof value.amountPaise === 'number') parts.push(formatPaise(value.amountPaise));
  if (typeof value.bps === 'number') parts.push(`${(value.bps / 100).toString()}%`);
  return parts.join(' · ');
}

export function depositReleaseBlockedReason(row: AdminTaxiBookingSummaryDto): string | null {
  const deposit = partnerDepositOf(row);
  if (!deposit) return 'No partner deposit recorded for this booking.';
  if (deposit.status === 'HELD' || deposit.status === 'DISPUTED_HOLD') return null;
  return `Deposit is ${humanizeAdminLabel(deposit.status)} — only a held deposit can be released.`;
}
