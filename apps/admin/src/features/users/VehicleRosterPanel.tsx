import { AlButton, AlDataTable, AlErrorState, AlText } from '@autolokate/ui';
import { useMemo } from 'react';

import { toVehicleRosterRows } from '@/features/users/vehicle-roster-rows';
import { useAdminVehicleDrivers } from '@/hooks/users/useAdminVehicleDrivers';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { AdminPanel, AdminStatusChip, shortAdminId } from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

/**
 * The vehicle's owner and full driver roster (`GET /admin/v1/vehicles/{vehicleId}/drivers`).
 * Rows carry only the username; the display name lives on the account, so each row opens it.
 */
export function VehicleRosterPanel({
  vehicleId,
  currentAccountId,
  onOpenAccount,
  testId = 'vehicle-roster',
}: {
  vehicleId: string;
  /** The account being viewed — its row says so instead of offering to reopen it. */
  currentAccountId: string;
  onOpenAccount: (accountId: string) => void;
  testId?: string;
}) {
  const { state, refresh } = useAdminVehicleDrivers(vehicleId);
  const rows = useMemo(() => toVehicleRosterRows(state.data), [state.data]);
  const title = state.data?.plate ? `Owner & drivers · ${state.data.plate}` : 'Owner & drivers';

  if (state.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Owner & drivers"
        endpoint="GET /admin/v1/vehicles/{vehicleId}/drivers"
        description="The vehicle's driver roster can't be read on this server yet."
      />
    );
  }

  return (
    <AdminPanel
      title={title}
      subtitle="Who owns this vehicle and every driver membership on it, newest first."
    >
      {state.error ? (
        <AlErrorState message={state.error} onRetry={refresh} />
      ) : (
        <div data-testid={testId}>
          {!state.isLoading && state.data && !state.data.owner ? (
            <AlText variant="caption" tone="muted" data-testid={`${testId}-no-owner`}>
              No owner yet: nobody has paid for or claimed this vehicle.
            </AlText>
          ) : null}
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId={`${testId}-table`}
            columns={[
              {
                id: 'account',
                header: 'Account',
                accessorFn: (row) => row.username ?? row.accountId,
                cell: ({ row }) => (
                  <span title={row.original.accountId}>
                    {row.original.username ? (
                      row.original.username
                    ) : (
                      <span className="admin-mono">{shortAdminId(row.original.accountId)}</span>
                    )}
                  </span>
                ),
              },
              { id: 'role', header: 'Role', accessorFn: (row) => row.role },
              {
                id: 'status',
                header: 'Status',
                accessorFn: (row) => row.status,
                cell: ({ row }) => (
                  <AdminStatusChip label={row.original.status} tone={row.original.statusTone} />
                ),
              },
              {
                id: 'since',
                header: 'Requested',
                accessorFn: (row) => row.since ?? '',
                cell: ({ row }) =>
                  row.original.since ? formatAdminDateTime(row.original.since) : '—',
              },
              {
                id: 'resolved',
                header: 'Resolved / verified',
                accessorFn: (row) => row.resolvedAt ?? '',
                cell: ({ row }) =>
                  row.original.resolvedAt ? formatAdminDateTime(row.original.resolvedAt) : '—',
              },
              {
                id: 'open',
                header: '',
                enableSorting: false,
                cell: ({ row }) =>
                  row.original.accountId === currentAccountId ? (
                    <AlText variant="caption" tone="muted">
                      This customer
                    </AlText>
                  ) : (
                    <AlButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      data-testid={`${testId}-open-${row.original.accountId}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenAccount(row.original.accountId);
                      }}
                    >
                      Open account
                    </AlButton>
                  ),
              },
            ]}
            data={rows}
            loading={state.isLoading}
            emptyTitle="No owner or drivers"
            emptyDescription="Nobody owns or drives this vehicle yet."
            getRowId={(row) => row.key}
          />
        </div>
      )}
    </AdminPanel>
  );
}
