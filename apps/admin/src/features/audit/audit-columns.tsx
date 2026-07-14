import type { AuditEventDto } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { AuditActionBadge } from '@/platform/components/EntityStatusBadge';
import { formatAuditField } from '@/platform/utils/audit-field';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function formatActor(event: AuditEventDto): string {
  if (event.actorAdminId) {
    return 'Admin user';
  }
  if (event.actorAccountId) {
    return 'Account';
  }
  return 'System';
}

export function useAuditColumns(): ColumnDef<AuditEventDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'at',
        header: 'Timestamp',
        cell: ({ row }) => formatDateTime(row.original.at),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
      },
      {
        id: 'actor',
        header: 'Actor',
        cell: ({ row }) => formatActor(row.original),
      },
      {
        accessorKey: 'targetType',
        header: 'Entity type',
        cell: ({ row }) => formatAuditField(row.original.targetType),
      },
    ],
    [],
  );
}
