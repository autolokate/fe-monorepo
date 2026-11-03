import type { AdminScanFlagDto, AdminScanScannerDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, AlErrorState, AlModal, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import {
  HOUR_OPTIONS,
  HOUR_VALUES,
  ScannerCell,
  type HourOption,
} from '@/features/plate-scanning/PlateScanningLookupsTab';
import { useScanAbuse } from '@/hooks/plate-scanning/usePlateScanning';
import { AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
} from '@/platform/components/AdminWowSurface';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

function scannerKey(row: { accountId: string | null; webSessionId: string | null }): string {
  return row.accountId ?? row.webSessionId ?? 'unknown';
}

/** Heaviest scanners in the window + the abuse flags that block them, with an audited clear. */
export function PlateScanningAbuseTab() {
  const canWrite = useAdminPermission('users:write');
  const [hours, setHours] = useUrlFilterState<HourOption>('hours', '24', HOUR_VALUES);
  const abuse = useScanAbuse(Number(hours));
  const [pending, setPending] = useState<AdminScanFlagDto | null>(null);
  const { clearMutation } = abuse;

  const scannerColumns = useMemo<ColumnDef<AdminScanScannerDto>[]>(
    () => [
      {
        id: 'scanner',
        header: 'Scanner',
        accessorFn: scannerKey,
        cell: ({ row }) => (
          <ScannerCell
            accountId={row.original.accountId}
            webSessionId={row.original.webSessionId}
          />
        ),
      },
      { accessorKey: 'lookups', header: 'Lookups' },
      { accessorKey: 'distinctPlates', header: 'Distinct plates' },
      { accessorKey: 'noMatch', header: 'No match' },
      { accessorKey: 'stepUps', header: 'Step-ups' },
      { accessorKey: 'retryLater', header: 'Retry later' },
      { accessorKey: 'maxScore', header: 'Max score' },
    ],
    [],
  );

  const flagColumns = useMemo<ColumnDef<AdminScanFlagDto>[]>(
    () => [
      {
        id: 'scanner',
        header: 'Scanner',
        accessorFn: scannerKey,
        cell: ({ row }) => (
          <ScannerCell
            accountId={row.original.accountId}
            webSessionId={row.original.webSessionId}
          />
        ),
      },
      { id: 'reason', header: 'Reason', accessorFn: (row) => humanizeAdminLabel(row.reason) },
      { accessorKey: 'score', header: 'Score' },
      {
        id: 'createdAt',
        header: 'Flagged',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
      },
      {
        id: 'blockedUntil',
        header: 'Blocked until',
        accessorFn: (row) => row.blockedUntil,
        cell: ({ row }) => formatAdminDateTime(row.original.blockedUntil),
      },
      {
        id: 'state',
        header: 'State',
        accessorFn: (row) => (row.clearedAt ? 'Cleared' : 'Active'),
        cell: ({ row }) =>
          row.original.clearedAt ? (
            <AdminStatusChip
              label={`Cleared ${formatAdminDateTime(row.original.clearedAt)}`}
              tone="none"
            />
          ) : (
            <AdminStatusChip label="Active" tone="draft" />
          ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canWrite && !row.original.clearedAt ? (
            <AlButton
              size="sm"
              variant="secondary"
              data-testid={`plate-flag-clear-${row.original.id}`}
              onClick={(event) => {
                event.stopPropagation();
                clearMutation.reset();
                setPending(row.original);
              }}
            >
              Clear flag
            </AlButton>
          ) : null,
      },
    ],
    [canWrite, clearMutation],
  );

  if (abuse.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Scan abuse"
        endpoint="GET /admin/v1/scan/abuse"
        description="Scan abuse review is not available on this server yet."
      />
    );
  }

  const clearError = clearMutation.isError
    ? mapAdminApiError(clearMutation.error).userMessage
    : null;

  return (
    <>
      <div className="admin-v4-toolbar">
        <AdminFilterField label="Window">
          <AdminFilterChips
            options={HOUR_OPTIONS}
            value={hours}
            onChange={setHours}
            aria-label="Look-back window"
          />
        </AdminFilterField>
      </div>
      {abuse.error ? (
        <AlErrorState message={abuse.error} onRetry={abuse.refresh} />
      ) : (
        <>
          <AdminPanel
            title="Abuse flags"
            subtitle="Scanners blocked for scanning too many distinct plates or a high abuse score. Clearing unblocks them now."
          >
            <div data-testid="plate-abuse-flags">
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="plate-abuse-flags-table"
                columns={flagColumns}
                data={abuse.data?.flags ?? []}
                loading={abuse.isLoading}
                enableGlobalSearch={false}
                emptyTitle="No abuse flags"
                emptyDescription="No scanner was flagged in this window."
                getRowId={(row) => row.id}
              />
            </div>
          </AdminPanel>
          <AdminPanel
            title="Top scanners"
            subtitle="Who looked up the most plates in this window — accounts and web sessions."
          >
            <div data-testid="plate-abuse-scanners">
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="plate-abuse-scanners-table"
                columns={scannerColumns}
                data={abuse.data?.scanners ?? []}
                loading={abuse.isLoading}
                enableGlobalSearch={false}
                emptyTitle="No scanners"
                emptyDescription="No plate lookups in this window."
                getRowId={(row) => scannerKey(row)}
              />
            </div>
          </AdminPanel>
        </>
      )}

      <AlModal
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !clearMutation.isPending) setPending(null);
        }}
        title="Clear this abuse flag?"
        description="The scanner can look up plates again immediately."
        footer={
          <div className="admin-modal-actions">
            <AlButton
              variant="secondary"
              disabled={clearMutation.isPending}
              onClick={() => {
                setPending(null);
              }}
            >
              Cancel
            </AlButton>
            <AlButton
              data-testid="plate-flag-clear-confirm"
              loading={clearMutation.isPending}
              onClick={() => {
                if (!pending) return;
                clearMutation.mutate(pending.id, {
                  onSuccess: () => {
                    setPending(null);
                  },
                });
              }}
            >
              Clear flag
            </AlButton>
          </div>
        }
      >
        <p className="admin-empty-note" data-testid="plate-flag-clear-note">
          The server records which operator cleared the flag and when. It does not accept a reason
          for this action yet, so none is asked for here — note the context in the ticket instead.
        </p>
        {clearError ? (
          <p className="admin-form-error" role="alert">
            {clearError}
          </p>
        ) : null}
      </AlModal>
    </>
  );
}
