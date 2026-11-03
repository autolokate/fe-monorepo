import type {
  AdminNotificationAudience,
  AdminUserDeviceDto,
  AdminUserNotificationDto,
} from '@autolokate/api-client';
import { AlButton, AlDataTable, AlErrorState, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { useUserDevices, useUserNotifications } from '@/hooks/users/useAdminUserV4';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './users-v4.css';

const AUDIENCE_FILTERS: { value: AdminNotificationAudience | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CONSUMER', label: 'Consumer app' },
  { value: 'PARTNER', label: 'Partner app' },
];

const DELIVERY_TONE: Record<string, AdminStatusChipTone> = {
  DELIVERED: 'active',
  SENT: 'published',
  QUEUED: 'draft',
  FAILED: 'none',
};

function DeliveryCell({ delivery }: { delivery: AdminUserNotificationDto['delivery'] }) {
  if (!delivery) {
    return <span className="admin-v4-stack__secondary">No send recorded</span>;
  }
  return (
    <span className="admin-v4-stack">
      <AdminStatusChip
        label={humanizeAdminLabel(delivery.status)}
        tone={DELIVERY_TONE[delivery.status] ?? 'neutral'}
      />
      <span className="admin-v4-stack__secondary">
        {[
          delivery.channel ? humanizeAdminLabel(delivery.channel) : null,
          delivery.sentAt ? formatAdminDateTime(delivery.sentAt) : null,
        ]
          .filter(Boolean)
          .join(' · ') || '—'}
      </span>
    </span>
  );
}

function DevicesTable({ userId }: { userId: string }) {
  const { devices, isLoading, notDeployed, error, refresh } = useUserDevices(userId, true);
  const columns = useMemo<ColumnDef<AdminUserDeviceDto>[]>(
    () => [
      { id: 'app', header: 'App', accessorFn: (row) => humanizeAdminLabel(row.app) },
      { id: 'platform', header: 'Platform', accessorFn: (row) => humanizeAdminLabel(row.platform) },
      {
        id: 'registeredAt',
        header: 'Registered',
        accessorFn: (row) => row.registeredAt,
        cell: ({ row }) => formatAdminDateTime(row.original.registeredAt),
      },
      {
        id: 'lastSeenAt',
        header: 'Last seen',
        accessorFn: (row) => row.lastSeenAt ?? '',
        cell: ({ row }) => formatAdminDateTime(row.original.lastSeenAt),
      },
      {
        id: 'token',
        header: 'Push token',
        accessorFn: (row) => row.tokenSuffix,
        cell: ({ row }) => <span className="admin-mono">…{row.original.tokenSuffix}</span>,
      },
    ],
    [],
  );
  if (notDeployed) {
    return (
      <AdminNotDeployedState
        title="Devices"
        endpoint="GET /admin/v1/users/{userId}/devices"
        description="Registered devices can't be read on this server yet."
      />
    );
  }
  if (error) return <AlErrorState message={error} onRetry={refresh} />;
  return (
    <div data-testid="user-devices">
      <AlDataTable
        {...ADMIN_LIST_TABLE_PROPS}
        tableId="user-devices-table"
        columns={columns}
        data={devices}
        loading={isLoading}
        enableGlobalSearch={false}
        emptyTitle="No registered devices"
        emptyDescription="This account has no push token registered — pushes can't reach it."
        getRowId={(row) => `${row.app}-${row.platform}-${row.tokenSuffix}`}
      />
    </div>
  );
}

/**
 * The account's role-aware inbox with delivery state, plus its push devices. Reading the inbox is an
 * audited PII read (`NOTIFICATION_INBOX_ACCESS`, one row per page), so nothing loads until asked.
 */
export function UserNotificationsPanel({ userId }: { userId: string }) {
  const [optedIn, setOptedIn] = useState(false);
  const [audience, setAudience] = useState<AdminNotificationAudience | 'ALL'>('ALL');
  const list = useUserNotifications(userId, audience, optedIn);

  const columns = useMemo<ColumnDef<AdminUserNotificationDto>[]>(
    () => [
      {
        id: 'message',
        header: 'Notification',
        accessorFn: (row) => row.title,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span className="admin-v4-stack__primary">{row.original.title}</span>
            <span className="admin-v4-stack__secondary admin-v4-clamp">{row.original.body}</span>
          </span>
        ),
      },
      {
        id: 'audience',
        header: 'App',
        accessorFn: (row) => humanizeAdminLabel(row.audience),
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => row.category,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span>{humanizeAdminLabel(row.original.category)}</span>
            {row.original.sourceCategory !== row.original.category ? (
              <span className="admin-v4-stack__secondary">
                {humanizeAdminLabel(row.original.sourceCategory)}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'deepLink',
        header: 'Opens',
        accessorFn: (row) => row.deepLink.screen,
        cell: ({ row }) => <span className="admin-mono">{row.original.deepLink.screen}</span>,
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
      },
      {
        id: 'readAt',
        header: 'Read',
        accessorFn: (row) => row.readAt ?? '',
        cell: ({ row }) =>
          row.original.readAt ? formatAdminDateTime(row.original.readAt) : 'Unread',
      },
      {
        id: 'delivery',
        header: 'Delivery',
        accessorFn: (row) => row.delivery?.status ?? '',
        cell: ({ row }) => <DeliveryCell delivery={row.original.delivery} />,
      },
    ],
    [],
  );

  return (
    <AdminPanel
      title="Notifications & devices"
      subtitle="What this account was sent (consumer and partner inbox), whether it was delivered, and its push devices."
    >
      <p className="admin-audit-note" data-testid="user-notifications-audit-note">
        <span>
          <strong>Viewing writes an audit row.</strong> Each page of this inbox you load (including
          Load more and changing the app filter) is recorded as NOTIFICATION_INBOX_ACCESS against
          your operator account.
        </span>
      </p>
      {!optedIn ? (
        <div className="admin-v4-gate">
          <AlButton
            size="sm"
            data-testid="user-notifications-load"
            onClick={() => {
              setOptedIn(true);
            }}
          >
            Load notifications
          </AlButton>
        </div>
      ) : list.notDeployed ? (
        <AdminNotDeployedState
          title="Notifications"
          endpoint="GET /admin/v1/users/{userId}/notifications"
          description="The notification inbox can't be read on this server yet."
        />
      ) : (
        <>
          <div className="admin-v4-toolbar">
            <AdminFilterChips
              options={AUDIENCE_FILTERS}
              value={audience}
              onChange={setAudience}
              aria-label="Notification app"
            />
          </div>
          {list.error ? (
            <AlErrorState message={list.error} onRetry={list.refresh} />
          ) : (
            <div data-testid="user-notifications">
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="user-notifications-table"
                columns={columns}
                data={list.items}
                loading={list.isLoading}
                enableGlobalSearch={false}
                emptyTitle="No notifications"
                emptyDescription="Nothing in this account's inbox for this app."
                getRowId={(row) => row.id}
              />
              <AdminLoadMore
                hasMore={list.hasMore}
                loading={list.isFetchingNextPage}
                onLoadMore={list.loadMore}
                testId="user-notifications-load-more"
              />
            </div>
          )}
          <div className="admin-v4-subsection">
            <h3 className="admin-v4-subsection__title">Push devices</h3>
            <DevicesTable userId={userId} />
          </div>
        </>
      )}
    </AdminPanel>
  );
}
