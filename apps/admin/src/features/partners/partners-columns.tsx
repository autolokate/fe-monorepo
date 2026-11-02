import type { AdminPartnerOrgDto } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { PartnerGstBadge, partnerGstLabel } from '@/features/partners/partner-gst';
import { formatPartnersDateTime, shortId } from '@/features/partners/partners-filters';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

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
        cell: ({ row }) => humanizeAdminLabel(row.original.partnerKind),
      },
      {
        id: 'storeStatus',
        header: 'Store',
        accessorFn: (row) => row.storeStatus ?? '',
        cell: ({ row }) =>
          row.original.storeStatus ? humanizeAdminLabel(row.original.storeStatus) : '—',
      },
      {
        id: 'gst',
        header: 'GST',
        accessorFn: (row) => partnerGstLabel(row.gstVerification),
        cell: ({ row }) => (
          <PartnerGstBadge
            value={row.original.gstVerification}
            testId={`partners-gst-badge-${row.original.orgId}`}
          />
        ),
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
