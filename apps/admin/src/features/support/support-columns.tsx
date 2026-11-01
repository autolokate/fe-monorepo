import type { AdminSupportTicketSummary } from '@autolokate/api-client';
import { type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { humanizeAdminLabel, shortAdminId } from '@/platform/components/AdminWowSurface';
import { SupportTicketStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

/** List columns — subject only; the customer's message never reaches the admin plane. */
export function useSupportColumns(): ColumnDef<AdminSupportTicketSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'subject',
        header: 'Subject',
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => humanizeAdminLabel(row.original.type),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <SupportTicketStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'accountId',
        header: 'Account',
        cell: ({ row }) => shortAdminId(row.original.accountId),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatDateTime(row.original.updatedAt),
      },
    ],
    [],
  );
}
