import type { AuditEventDto } from '@autolokate/api-client';
import { AlStatusBadge, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatAuditField } from '@/platform/utils/audit-field.js';

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
        accessorKey: 'actorAdminId',
        header: 'Actor (admin)',
        cell: ({ row }) => formatAuditField(row.original.actorAdminId),
      },
      {
        accessorKey: 'targetType',
        header: 'Entity type',
        cell: ({ row }) => formatAuditField(row.original.targetType),
      },
      {
        accessorKey: 'targetId',
        header: 'Target ID',
        cell: ({ row }) => formatAuditField(row.original.targetId),
      },
    ],
    [],
  );
}
