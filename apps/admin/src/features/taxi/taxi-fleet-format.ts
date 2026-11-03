import type { AdminTaxiBidBlocker, AdminTaxiMediaSlot } from '@autolokate/api-client';

import type { AdminStatusChipTone } from '@/platform/components/AdminWowSurface';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

export const TAXI_FLEET_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RETIRED', label: 'Retired' },
] as const;

export const TAXI_FLEET_CAN_BID_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'YES', label: 'Can bid' },
  { value: 'NO', label: 'Blocked' },
] as const;

export const TAXI_FLEET_MEDIA_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'CURRENT', label: 'Current' },
  { value: 'EXPIRING', label: 'Expiring' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'MISSING', label: 'Missing' },
] as const;

const SLOT_LABELS: Partial<Record<string, string>> & Record<AdminTaxiMediaSlot, string> = {
  FRONT: 'Front',
  REAR: 'Rear',
  SIDE: 'Side',
  INTERIOR: 'Interior',
  VIDEO: 'Video (≤ 30 s)',
};

export function taxiMediaSlotLabel(slot: string): string {
  return SLOT_LABELS[slot] ?? humanizeAdminLabel(slot);
}

const BLOCKER_LABELS: Partial<Record<string, string>> & Record<AdminTaxiBidBlocker, string> = {
  RC_NOT_APPROVED: 'RC not approved',
  MEDIA_MISSING: 'Media missing',
  MEDIA_EXPIRED: 'Media expired',
  VEHICLE_RETIRED: 'Vehicle retired',
  DRIVER_MISSING: 'No driver set',
  DRIVER_PHOTO_MISSING: 'Driver photo missing',
};

export function taxiBidBlockerLabel(blocker: string): string {
  return BLOCKER_LABELS[blocker] ?? humanizeAdminLabel(blocker);
}

export function taxiMediaStatusTone(status: string): AdminStatusChipTone {
  if (status === 'CURRENT') return 'active';
  if (status === 'EXPIRING') return 'draft';
  if (status === 'EXPIRED' || status === 'MISSING') return 'none';
  return 'neutral';
}

export function taxiRcTone(status: string): AdminStatusChipTone {
  if (status === 'APPROVED') return 'active';
  if (status === 'IN_REVIEW') return 'draft';
  if (status === 'REJECTED') return 'none';
  return 'neutral';
}

export function vehicleTitle(row: {
  make: string | null;
  model: string | null;
  color?: string | null;
  label?: string | null;
}): string {
  const name = [row.make, row.model].filter(Boolean).join(' ');
  const base = name || row.label || 'Vehicle';
  return row.color ? `${base} · ${row.color}` : base;
}
