import type {
  AdminVehicleDriverStatus,
  AdminVehicleDriversDto,
  AdminVehicleOwnerRole,
} from '@autolokate/api-client';

import type { AdminStatusChipTone } from '@/platform/components/AdminWowSurface';

const OWNER_ROLE_LABEL: Record<AdminVehicleOwnerRole, string> = {
  OWNER: 'Owner',
  PROVISIONAL_OWNER: 'Provisional owner',
};

const DRIVER_STATUS_LABEL: Record<AdminVehicleDriverStatus, string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
  REMOVED: 'Removed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

const DRIVER_STATUS_TONE: Record<AdminVehicleDriverStatus, AdminStatusChipTone> = {
  PENDING: 'draft',
  ACTIVE: 'active',
  SUSPENDED: 'draft',
  REJECTED: 'none',
  REMOVED: 'none',
  CANCELLED: 'none',
  EXPIRED: 'none',
};

export type VehicleRosterRow = {
  key: string;
  accountId: string;
  username: string | null;
  role: string;
  status: string;
  statusTone: AdminStatusChipTone;
  /** Driver request time; owners have none on this route. */
  since: string | null;
  resolvedAt: string | null;
};

/** Owner first, then every driver membership in the server's order (newest first). */
export function toVehicleRosterRows(data: AdminVehicleDriversDto | null): VehicleRosterRow[] {
  if (!data) return [];
  const rows: VehicleRosterRow[] = [];
  if (data.owner) {
    rows.push({
      key: `owner:${data.owner.accountId}`,
      accountId: data.owner.accountId,
      username: data.owner.username,
      role: OWNER_ROLE_LABEL[data.owner.role],
      status: data.owner.ownershipVerified ? 'RC verified' : 'RC not verified',
      statusTone: data.owner.ownershipVerified ? 'active' : 'draft',
      since: null,
      resolvedAt: data.owner.ownershipVerifiedAt,
    });
  }
  for (const driver of data.drivers) {
    rows.push({
      key: `driver:${driver.id}`,
      accountId: driver.accountId,
      username: driver.username,
      role: 'Driver',
      status: DRIVER_STATUS_LABEL[driver.status],
      statusTone: DRIVER_STATUS_TONE[driver.status],
      since: driver.createdAt,
      resolvedAt: driver.resolvedAt,
    });
  }
  return rows;
}
