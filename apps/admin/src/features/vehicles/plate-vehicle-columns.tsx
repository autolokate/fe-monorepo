import type { AdminPlateProtection, AdminPlateVehicleDto } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';

export const PROTECTION_TONE: Record<AdminPlateProtection, AdminStatusChipTone> = {
  PROTECTED: 'active',
  EXPIRING: 'draft',
  UNPROTECTED: 'none',
};

export function adminUserAccountPath(accountId: string): string {
  return `${adminPaths.users}?account=${encodeURIComponent(accountId)}`;
}

/** Owner account as a link into Customers (opens that account). */
export function OwnerAccountLink({ accountId }: { accountId: string | null }) {
  if (!accountId) return <span className="admin-v4-stack__secondary">No owner</span>;
  return (
    <Link
      className="admin-link admin-mono"
      to={adminUserAccountPath(accountId)}
      title={accountId}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {shortAdminId(accountId)}
    </Link>
  );
}

export function usePlateVehicleColumns(): ColumnDef<AdminPlateVehicleDto>[] {
  return useMemo<ColumnDef<AdminPlateVehicleDto>[]>(
    () => [
      {
        accessorKey: 'registration',
        header: 'Registration',
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span className="admin-v4-stack__primary admin-mono">{row.original.registration}</span>
            <span className="admin-v4-stack__secondary admin-mono">
              key {row.original.plateKey ?? 'unparsed'}
            </span>
          </span>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        accessorFn: (row) => [row.make, row.model, row.color].filter(Boolean).join(' · '),
        cell: ({ row }) =>
          [row.original.make, row.original.model, row.original.color].filter(Boolean).join(' · ') ||
          '—',
      },
      {
        id: 'owner',
        header: 'Owner account',
        accessorFn: (row) => row.ownerAccountId ?? '',
        cell: ({ row }) => <OwnerAccountLink accountId={row.original.ownerAccountId} />,
      },
      {
        id: 'verified',
        header: 'Ownership',
        accessorFn: (row) => (row.ownershipVerified ? 'Verified' : 'Unverified'),
        cell: ({ row }) => (
          <AdminStatusChip
            label={row.original.ownershipVerified ? 'RC verified' : 'Not verified'}
            tone={row.original.ownershipVerified ? 'active' : 'none'}
          />
        ),
      },
      {
        id: 'protection',
        header: 'Protection',
        accessorFn: (row) => row.protection,
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.protection)}
            tone={PROTECTION_TONE[row.original.protection]}
          />
        ),
      },
    ],
    [],
  );
}
