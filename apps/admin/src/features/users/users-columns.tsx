import type { AdminUserSummaryDto } from '@autolokate/api-client';
import { AlStatusBadge, AlText } from '@autolokate/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export function useUsersColumns(): ColumnDef<AdminUserSummaryDto>[] {
  return useMemo(
    () => [
      {
        id: 'id',
        header: 'Account',
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <AlText variant="caption" tone="muted">
            {row.original.id}
          </AlText>
        ),
      },
      {
        id: 'accountType',
        header: 'Type',
        accessorKey: 'accountType',
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AlStatusBadge
            label={row.original.status}
            status={row.original.status === 'ACTIVE' ? 'success' : 'inactive'}
          />
        ),
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: ({ row }) => {
          const roles = row.original.roles;
          if (roles.length === 0) {
            return <AlText tone="muted">None</AlText>;
          }
          return (
            <span className="admin-user-account__roles">
              {roles.map((role) => (
                <AlStatusBadge
                  key={`${role.role}:${role.scopeRef ?? 'platform'}`}
                  label={role.role}
                  status="inactive"
                />
              ))}
            </span>
          );
        },
      },
      {
        id: 'locale',
        header: 'Locale',
        accessorKey: 'locale',
      },
      {
        id: 'fraudFlagged',
        header: 'Flagged',
        cell: ({ row }) =>
          row.original.fraudFlagged ? (
            <AlStatusBadge label="Review" status="pending" />
          ) : (
            <AlText tone="muted">—</AlText>
          ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => (
          <AlText variant="caption" tone="muted">
            {new Date(row.original.createdAt).toLocaleString()}
          </AlText>
        ),
      },
    ],
    [],
  );
}
