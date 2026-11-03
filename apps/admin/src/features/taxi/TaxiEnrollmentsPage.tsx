import type { AdminTaxiEnrollmentDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { TaxiProvisionSheet } from '@/features/taxi/TaxiProvisionSheet';
import { TAXI_ENROLLMENT_STATUS_FILTERS } from '@/features/taxi/taxi-ops-format';
import { useTaxiEnrollments } from '@/hooks/taxi/useTaxiOperations';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { AdminReasonDialog } from '@/platform/components/AdminReasonDialog';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime, shortAdminId } from '@/platform/utils/format-admin-date';

import './taxi-policy.css';

type PendingAction =
  | { kind: 'suspend'; row: AdminTaxiEnrollmentDto }
  | { kind: 'reinstate'; row: AdminTaxiEnrollmentDto }
  | null;

export function TaxiEnrollmentsPage() {
  const canWrite = useAdminPermission('taxi:write');
  const {
    enrollments,
    status,
    setStatus,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    notDeployed,
    userErrorMessage,
    refresh,
    data,
    suspend,
    suspendError,
    reinstate,
    reinstateError,
  } = useTaxiEnrollments();
  const [pending, setPending] = useState<PendingAction>(null);
  const [provisionOpen, setProvisionOpen] = useState(false);

  const columns = useMemo<ColumnDef<AdminTaxiEnrollmentDto>[]>(
    () => [
      {
        id: 'org',
        header: 'Partner org',
        accessorFn: (row) => row.orgName ?? row.orgId,
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">
              {row.original.orgName ?? shortAdminId(row.original.orgId)}
            </span>
            <span className="partners-cell-title__secondary admin-mono">{row.original.orgId}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Enrollment',
        cell: ({ row }) => (
          <span className="admin-status-chip admin-status-chip--neutral">
            {humanizeAdminLabel(row.original.status)}
          </span>
        ),
      },
      {
        id: 'enrolledAt',
        header: 'Enrolled',
        accessorFn: (row) => formatAdminDateTime(row.enrolledAt),
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        accessorFn: (row) => formatAdminDateTime(row.updatedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          !canWrite ? null : row.original.status === 'ACTIVE' ? (
            <AlButton
              size="sm"
              variant="secondary"
              data-testid={`taxi-enrollment-suspend-${row.original.orgId}`}
              onClick={(event) => {
                event.stopPropagation();
                suspend.reset();
                setPending({ kind: 'suspend', row: row.original });
              }}
            >
              Suspend
            </AlButton>
          ) : row.original.status === 'SUSPENDED' ? (
            <AlButton
              size="sm"
              variant="secondary"
              data-testid={`taxi-enrollment-reinstate-${row.original.orgId}`}
              onClick={(event) => {
                event.stopPropagation();
                reinstate.reset();
                setPending({ kind: 'reinstate', row: row.original });
              }}
            >
              Reinstate
            </AlButton>
          ) : (
            <AlText tone="muted" variant="caption">
              Revoked — re-provision to restore
            </AlText>
          ),
      },
    ],
    [canWrite, reinstate, suspend],
  );

  const busy = suspend.isPending || reinstate.isPending;
  const actionError = pending?.kind === 'suspend' ? suspendError : reinstateError;

  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi partners"
          description="Taxi enrollments — who may bid on rides. Suspend blocks new bids; reinstate restores them."
          actions={
            <>
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
              {canWrite ? (
                <AlPageHeaderAction
                  label="Provision Taxi partner"
                  onClick={() => {
                    setProvisionOpen(true);
                  }}
                />
              ) : null}
            </>
          }
        />

        {notDeployed ? (
          <AdminNotDeployedState
            title="Taxi enrollments"
            endpoint="GET /admin/v1/taxi/enrollments"
            description="The enrollment list is not available on this server yet. Provisioning still works."
          />
        ) : userErrorMessage && !data ? (
          <AlErrorState message={userErrorMessage} onRetry={refresh} />
        ) : (
          <>
            <AdminDataBlock
              filters={
                <AdminFilterField label="Status">
                  <AdminFilterChips
                    options={TAXI_ENROLLMENT_STATUS_FILTERS}
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                    }}
                    aria-label="Enrollment status"
                  />
                </AdminFilterField>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="taxi-enrollments"
                columns={columns}
                data={enrollments}
                loading={isLoading}
                isRefreshing={isFetching && !isFetchingNextPage}
                error={userErrorMessage}
                onRetry={refresh}
                enableGlobalSearch={false}
                emptyTitle="No taxi enrollments"
                emptyDescription="Provision a Taxi partner to create the first enrollment."
                getRowId={(row) => row.orgId}
              />
            </AdminDataBlock>
            {hasNextPage ? (
              <div className="partners-load-more">
                <AlButton
                  variant="secondary"
                  size="sm"
                  loading={isFetchingNextPage}
                  onClick={() => {
                    void fetchNextPage();
                  }}
                >
                  Load more
                </AlButton>
              </div>
            ) : null}
          </>
        )}

        <AdminReasonDialog
          open={pending !== null}
          onOpenChange={(next) => {
            if (!next && !busy) setPending(null);
          }}
          title={
            pending?.kind === 'suspend' ? 'Suspend Taxi enrollment?' : 'Reinstate Taxi enrollment?'
          }
          {...(pending
            ? {
                description: `${pending.row.orgName ?? pending.row.orgId} — ${
                  pending.kind === 'suspend'
                    ? 'the partner can no longer bid on new ride requests.'
                    : 'the partner can bid on ride requests again.'
                }`,
              }
            : {})}
          confirmLabel={pending?.kind === 'suspend' ? 'Suspend' : 'Reinstate'}
          required={pending?.kind === 'suspend'}
          destructive={pending?.kind === 'suspend'}
          loading={busy}
          error={actionError}
          testIdPrefix="taxi-enrollment"
          onConfirm={(reason) => {
            if (!pending) return;
            const done = {
              onSuccess: () => {
                setPending(null);
              },
            };
            if (pending.kind === 'suspend') {
              suspend.mutate({ orgId: pending.row.orgId, reason: reason ?? '' }, done);
            } else {
              reinstate.mutate({ orgId: pending.row.orgId, ...(reason ? { reason } : {}) }, done);
            }
          }}
        />

        <TaxiProvisionSheet open={provisionOpen} onOpenChange={setProvisionOpen} />
      </AlStack>
    </RequirePermission>
  );
}
