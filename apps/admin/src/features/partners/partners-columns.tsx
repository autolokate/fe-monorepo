import type { AdminPartnerOrgDto } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatPartnersDateTime, shortId } from '@/features/partners/partners-filters';

export function usePartnersColumns(): ColumnDef<AdminPartnerOrgDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Partner',
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">{row.original.name}</span>
            {row.original.storeName ? (
              <span className="partners-cell-title__secondary">{row.original.storeName}</span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'partnerKind',
        header: 'Kind',
      },
      {
        id: 'storeStatus',
        header: 'Store',
        accessorFn: (row) => row.storeStatus ?? '—',
      },
      {
        id: 'cities',
        header: 'Cities',
        accessorFn: (row) => (row.cities?.length ? row.cities.join(', ') : '—'),
      },
      {
        id: 'owner',
        header: 'Owner',
        accessorFn: (row) => shortId(row.ownerAccountId),
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
