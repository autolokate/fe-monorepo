import type { AdminUserSummaryDto } from '@autolokate/api-client';
import { AlText } from '@autolokate/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';

function statusTone(status: AdminUserSummaryDto['status']) {
  return status === 'ACTIVE' ? 'active' : 'none';
}

/**
 * Directory identity cell. No phone on the summary row — Type · Status is primary,
 * short account id is mono secondary (never the full id as the primary label).
 */
function AccountCell({ account }: { account: AdminUserSummaryDto }) {
  const title = `${humanizeAdminLabel(account.accountType)} · ${humanizeAdminLabel(account.status)}`;
  return (
    <div className="admin-primary-cell">
      <span className="admin-primary-cell__title">{title}</span>
      <span className="admin-id-secondary" title={account.id}>
        {shortAdminId(account.id)}
      </span>
    </div>
  );
}

export function useUsersColumns(): ColumnDef<AdminUserSummaryDto>[] {
  return useMemo(
    () => [
      {
        id: 'id',
        header: 'Account',
        accessorFn: (row) => row.id,
        cell: ({ row }) => <AccountCell account={row.original} />,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.status)}
            tone={statusTone(row.original.status)}
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
                <AdminStatusChip
                  key={`${role.role}:${role.scopeRef ?? 'platform'}`}
                  label={humanizeAdminLabel(role.role)}
                  tone="neutral"
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
            <AdminStatusChip label="Review" tone="draft" />
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
