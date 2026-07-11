import type { AuditEventDto } from '@autolokate/api-client';
import { AlStatusBadge, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatAuditField } from '@/platform/utils/audit-field';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function actionTone(action: string): 'active' | 'pending' | 'inactive' {
  if (action.includes('APPROVED') || action.includes('PAID') || action.includes('MINTED')) {
    return 'active';
  }
  if (action.includes('REJECTED') || action.includes('SCRAPPED') || action.includes('ERASURE')) {
    return 'inactive';
  }
  return 'pending';
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
        cell: ({ row }) => (
          <AlStatusBadge label={row.original.action} status={actionTone(row.original.action)} />
        ),
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
