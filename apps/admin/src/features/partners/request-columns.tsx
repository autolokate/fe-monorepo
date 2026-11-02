import type {
  AdminGarageBidDto,
  AdminGarageRequestInboxDto,
  AdminTaxiBidDto,
  AdminTaxiRequestInboxDto,
} from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import {
  formatCityState,
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
        accessorFn: (row) => `${row.pickupLabel} ${row.dropoffLabel}`,
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">{row.original.pickupLabel}</span>
            <span className="partners-cell-title__secondary">→ {row.original.dropoffLabel}</span>
          </div>
        ),
      },
      {
        id: 'cities',
        header: 'Cities',
        accessorFn: (row) =>
          [row.pickupCity, row.pickupState, row.dropoffCity, row.dropoffState]
            .filter(Boolean)
            .join(' '),
        cell: ({ row }) => {
          const from = formatCityState(row.original.pickupCity, row.original.pickupState);
          const to = formatCityState(row.original.dropoffCity, row.original.dropoffState);
          if (!from && !to) {
            return (
              <span
                className="partners-cell-title__secondary"
                title="Requests created before structured city/state was captured"
              >
                —
              </span>
            );
          }
          return (
            <div
              className="partners-cell-title"
              data-testid={`taxi-request-cities-${row.original.id}`}
            >
              <span className="partners-cell-title__primary">{from ?? '—'}</span>
              <span className="partners-cell-title__secondary">→ {to ?? '—'}</span>
            </div>
          );
        },
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
