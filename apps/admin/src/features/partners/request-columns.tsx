import type {
  AdminGarageBidDto,
  AdminGarageRequestInboxDto,
  AdminTaxiBidDto,
  AdminTaxiRequestInboxDto,
} from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import {
  formatPartnersDateTime,
  formatRupees,
  shortId,
} from '@/features/partners/partners-filters';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

export function useGarageRequestColumns(): ColumnDef<AdminGarageRequestInboxDto>[] {
  return useMemo(
    () => [
      {
        id: 'title',
        header: 'Request',
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">
              {row.original.title ?? row.original.category}
            </span>
            <span className="partners-cell-title__secondary">
              {[row.original.category, row.original.subcategory].filter(Boolean).join(' · ')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => humanizeAdminLabel(row.original.status),
      },
      {
        accessorKey: 'urgency',
        header: 'Urgency',
        cell: ({ row }) => humanizeAdminLabel(row.original.urgency),
      },
      {
        id: 'location',
        header: 'Location',
        accessorFn: (row) => [row.locality, row.city, row.state].filter(Boolean).join(', ') || '—',
      },
      {
        id: 'bids',
        header: 'Bids',
        accessorFn: (row) => row.bids.length,
        cell: ({ row }) => row.original.bids.length.toLocaleString(),
      },
      {
        id: 'account',
        header: 'Account',
        accessorFn: (row) => shortId(row.accountId),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatPartnersDateTime(row.original.createdAt),
      },
    ],
    [],
  );
}

export function useGarageBidColumns(): ColumnDef<AdminGarageBidDto>[] {
  return useMemo(
    () => [
      {
        id: 'org',
        header: 'Org',
        accessorFn: (row) => shortId(row.orgId),
      },
      {
        accessorKey: 'amountRupees',
        header: 'Amount',
        cell: ({ row }) => formatRupees(row.original.amountRupees),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => humanizeAdminLabel(row.original.status),
      },
      {
        accessorKey: 'startsOn',
        header: 'Starts',
      },
      {
        accessorKey: 'completionHours',
        header: 'Hours',
      },
      {
        accessorKey: 'warrantyDays',
        header: 'Warranty (d)',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatPartnersDateTime(row.original.createdAt),
      },
    ],
    [],
  );
}

export function useTaxiRequestColumns(): ColumnDef<AdminTaxiRequestInboxDto>[] {
  return useMemo(
    () => [
      {
        id: 'trip',
        header: 'Trip',
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">{row.original.pickupLabel}</span>
            <span className="partners-cell-title__secondary">→ {row.original.dropoffLabel}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => humanizeAdminLabel(row.original.status),
      },
      {
        accessorKey: 'pickupAt',
        header: 'Pickup',
        cell: ({ row }) => formatPartnersDateTime(row.original.pickupAt),
      },
      {
        accessorKey: 'estimatedFareRupees',
        header: 'Est. fare',
        cell: ({ row }) => formatRupees(row.original.estimatedFareRupees),
      },
      {
        id: 'bids',
        header: 'Bids',
        accessorFn: (row) => row.bids.length,
        cell: ({ row }) => row.original.bids.length.toLocaleString(),
      },
      {
        id: 'account',
        header: 'Account',
        accessorFn: (row) => shortId(row.accountId),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatPartnersDateTime(row.original.createdAt),
      },
    ],
    [],
  );
}

export function useTaxiBidColumns(): ColumnDef<AdminTaxiBidDto>[] {
  return useMemo(
    () => [
      {
        id: 'org',
        header: 'Org',
        accessorFn: (row) => shortId(row.orgId),
      },
      {
        accessorKey: 'fareRupees',
        header: 'Fare',
        cell: ({ row }) => formatRupees(row.original.fareRupees),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => humanizeAdminLabel(row.original.status),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        accessorFn: (row) => shortId(row.vehicleId),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatPartnersDateTime(row.original.createdAt),
      },
    ],
    [],
  );
}
