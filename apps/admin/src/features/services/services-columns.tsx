import type { AdminServiceProviderDto } from '@autolokate/api-client';
import { AlButton, AlStatusBadge, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

export type ServicesColumnActions = {
  onEdit: (row: AdminServiceProviderDto) => void;
  onDeactivate: (row: AdminServiceProviderDto) => void;
  canWrite: boolean;
  busyId: string | null;
};

function formatCoord(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(5);
}

export function useServicesColumns(
  actions: ServicesColumnActions,
): ColumnDef<AdminServiceProviderDto>[] {
  const { onEdit, onDeactivate, canWrite, busyId } = actions;

  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'city',
        header: 'City',
      },
      {
        id: 'coords',
        header: 'Lat / Lng',
        accessorFn: (row) => `${formatCoord(row.latitude)} / ${formatCoord(row.longitude)}`,
        cell: ({ row }) => (
          <span className="admin-detail-field__value--mono">
            {formatCoord(row.original.latitude)} / {formatCoord(row.original.longitude)}
          </span>
        ),
      },
      {
        id: 'verified',
        header: 'Verified',
        accessorFn: (row) => (row.verifiedPartner ? 'yes' : 'no'),
        cell: ({ row }) => (
          <AlStatusBadge
            label={row.original.verifiedPartner ? 'Verified' : 'Unverified'}
            status={row.original.verifiedPartner ? 'active' : 'inactive'}
          />
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <AlStatusBadge
            label={row.original.status}
            status={row.original.status === 'ACTIVE' ? 'active' : 'inactive'}
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const provider = row.original;
          const busy = busyId === provider.id;
          return (
            <div className="admin-modal-actions">
              <AlButton
                size="sm"
                variant="secondary"
                disabled={!canWrite || busy}
                data-testid={`services-edit-${provider.id}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(provider);
                }}
              >
                Edit
              </AlButton>
              <AlButton
                size="sm"
                variant="secondary"
                disabled={!canWrite || busy}
                loading={busy}
                data-testid={`services-deactivate-${provider.id}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDeactivate(provider);
                }}
              >
                Deactivate
              </AlButton>
            </div>
          );
        },
      },
    ],
    [busyId, canWrite, onDeactivate, onEdit],
  );
}
