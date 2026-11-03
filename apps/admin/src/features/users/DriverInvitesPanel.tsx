import type { AdminDriverInviteDto, AdminDriverInviteStatus } from '@autolokate/api-client';
import { AlDataTable, AlErrorState, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { useUserDriverInvites, useVehicleDriverInvites } from '@/hooks/users/useAdminUserV4';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './users-v4.css';

const INVITE_TONE: Record<AdminDriverInviteStatus, AdminStatusChipTone> = {
  PENDING: 'draft',
  ACCEPTED: 'active',
  DECLINED: 'none',
  CANCELLED: 'none',
  EXPIRED: 'none',
};

function AccountCell({
  username,
  accountId,
}: {
  username: string | null;
  accountId: string | null;
}) {
  if (!accountId) return <span className="admin-v4-stack__secondary">Not accepted yet</span>;
  return (
    <span className="admin-v4-stack" title={accountId}>
      <span className="admin-v4-stack__primary">{username ?? shortAdminId(accountId)}</span>
      {username ? (
        <span className="admin-v4-stack__secondary admin-mono">{shortAdminId(accountId)}</span>
      ) : null}
    </span>
  );
}

function useInviteColumns(showVehicle: boolean): ColumnDef<AdminDriverInviteDto>[] {
  return useMemo<ColumnDef<AdminDriverInviteDto>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.status)}
            tone={INVITE_TONE[row.original.status]}
          />
        ),
      },
      { accessorKey: 'phoneMasked', header: 'Invited phone' },
      ...(showVehicle
        ? [
            {
              id: 'vehicle',
              header: 'Vehicle',
              accessorFn: (row: AdminDriverInviteDto) => row.vehicleId,
              cell: ({ row }: { row: { original: AdminDriverInviteDto } }) => (
                <span className="admin-mono" title={row.original.vehicleId}>
                  {shortAdminId(row.original.vehicleId)}
                </span>
              ),
            } satisfies ColumnDef<AdminDriverInviteDto>,
          ]
        : []),
      {
        id: 'invitee',
        header: 'Invitee',
        accessorFn: (row) => row.inviteeUsername ?? row.inviteeAccountId ?? '',
        cell: ({ row }) => (
          <AccountCell
            username={row.original.inviteeUsername}
            accountId={row.original.inviteeAccountId}
          />
        ),
      },
      {
        id: 'invitedBy',
        header: 'Invited by',
        accessorFn: (row) => row.invitedByUsername ?? row.invitedByAccountId,
        cell: ({ row }) => (
          <AccountCell
            username={row.original.invitedByUsername}
            accountId={row.original.invitedByAccountId}
          />
        ),
      },
      {
        id: 'note',
        header: 'Note',
        accessorFn: (row) => row.note ?? '',
        cell: ({ row }) =>
          row.original.note ? <span className="admin-v4-clamp">{row.original.note}</span> : '—',
      },
      {
        id: 'createdAt',
        header: 'Sent',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
      },
      {
        id: 'expiresAt',
        header: 'Expires',
        accessorFn: (row) => row.expiresAt,
        cell: ({ row }) => formatAdminDateTime(row.original.expiresAt),
      },
      {
        id: 'resolvedAt',
        header: 'Resolved',
        accessorFn: (row) => row.resolvedAt ?? '',
        cell: ({ row }) => formatAdminDateTime(row.original.resolvedAt),
      },
    ],
    [showVehicle],
  );
}

type InviteList = ReturnType<typeof useUserDriverInvites>;

function InvitesTable({
  list,
  testId,
  showVehicle,
  endpoint,
  emptyDescription,
}: {
  list: InviteList;
  testId: string;
  showVehicle: boolean;
  endpoint: string;
  emptyDescription: string;
}) {
  const columns = useInviteColumns(showVehicle);
  if (list.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Driver invites"
        endpoint={endpoint}
        description="Driver invites can't be read on this server yet."
      />
    );
  }
  if (list.error) return <AlErrorState message={list.error} onRetry={list.refresh} />;
  return (
    <div data-testid={testId}>
      <AlDataTable
        {...ADMIN_LIST_TABLE_PROPS}
        tableId={`${testId}-table`}
        columns={columns}
        data={list.items}
        loading={list.isLoading}
        enableGlobalSearch={false}
        emptyTitle="No driver invites"
        emptyDescription={emptyDescription}
        getRowId={(row) => row.id}
      />
      <AdminLoadMore
        hasMore={list.hasMore}
        loading={list.isFetchingNextPage}
        onLoadMore={list.loadMore}
        testId={`${testId}-load-more`}
      />
    </div>
  );
}

/** Invites addressed to this account's verified phone, or accepted by it. Phones are last-4 only. */
export function UserDriverInvitesPanel({ userId }: { userId: string }) {
  const list = useUserDriverInvites(userId);
  return (
    <AdminPanel
      title="Driver invites received"
      subtitle="Invites sent to this account's phone or accepted by it. Expired = pending past its expiry."
    >
      <InvitesTable
        list={list}
        testId="user-driver-invites"
        showVehicle
        endpoint="GET /admin/v1/users/{userId}/driver-invites"
        emptyDescription="Nobody has invited this account to drive a vehicle."
      />
    </AdminPanel>
  );
}

/** Invites the vehicle's owner sent — answers "my driver never got the invite". */
export function VehicleDriverInvitesPanel({
  vehicleId,
  testId = 'vehicle-driver-invites',
}: {
  vehicleId: string;
  testId?: string;
}) {
  const list = useVehicleDriverInvites(vehicleId);
  return (
    <AdminPanel
      title="Driver invites"
      subtitle="Invites sent for this vehicle — pending, accepted, declined, cancelled or expired."
    >
      <InvitesTable
        list={list}
        testId={testId}
        showVehicle={false}
        endpoint="GET /admin/v1/vehicles/{vehicleId}/driver-invites"
        emptyDescription="No driver has been invited to this vehicle."
      />
    </AdminPanel>
  );
}
