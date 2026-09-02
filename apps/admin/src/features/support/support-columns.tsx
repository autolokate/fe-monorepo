import type { AdminSupportTicketSummary } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { SupportTicketStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export type UseSupportColumnsOptions = {
  /** Whether the signed-in admin may triage tickets (`support:write`). Off in read-only reuses. */
  canTriage?: boolean;
  /** Open the status-change dialog for a ticket. Omit to hide the triage action entirely. */
  onChangeStatus?: (ticket: AdminSupportTicketSummary) => void;
};

export function useSupportColumns({
  canTriage = false,
  onChangeStatus,
}: UseSupportColumnsOptions = {}): ColumnDef<AdminSupportTicketSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'subject',
        header: 'Subject',
      },
      {
        accessorKey: 'type',
        header: 'Type',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <SupportTicketStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'accountId',
        header: 'Account',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canTriage && onChangeStatus ? (
            <AlButton
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                onChangeStatus(row.original);
              }}
            >
              Change status
            </AlButton>
          ) : null,
      },
    ],
    [canTriage, onChangeStatus],
  );
}
