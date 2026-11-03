import type { AdminTaxiRefundQueueDto } from '@autolokate/api-client';
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
import { Link } from 'react-router-dom';

import { adminTaxiBookingPath } from '@/app/routes/admin-paths';
import { useTaxiRefunds } from '@/hooks/taxi/useTaxiRefunds';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { AdminReasonDialog } from '@/platform/components/AdminReasonDialog';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime, formatPaise, shortAdminId } from '@/platform/utils/format-admin-date';

import './taxi-v4.css';

const STATUS_FILTERS = [
  { value: 'NEEDS_ACTION', label: 'Needs action (failed + reconciliation)' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'NEEDS_RECONCILIATION', label: 'Needs reconciliation' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'SUBMITTING', label: 'Submitting' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSED', label: 'Processed' },
] as const;

const RETRYABLE = new Set(['FAILED', 'NEEDS_RECONCILIATION']);

const KIND_LABELS: Record<string, string> = {
  CUSTOMER_ADVANCE: 'Booking fee (customer)',
  PARTNER_DEPOSIT: 'Deposit (partner)',
};

function statusTone(status: string): AdminStatusChipTone {
  if (status === 'PROCESSED') return 'active';
  if (status === 'FAILED' || status === 'NEEDS_RECONCILIATION') return 'none';
  return 'draft';
}

function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/** Taxi refunds that failed or need reconciliation — money rules v2 says never silently lost. */
export function TaxiRefundsPage() {
  const canWrite = useAdminPermission('taxi:write');
  const queue = useTaxiRefunds();
  // One key per retry attempt: generated when the dialog opens, reused if the same attempt is resent.
  const [pending, setPending] = useState<{ row: AdminTaxiRefundQueueDto; key: string } | null>(
    null,
  );

  const columns = useMemo<ColumnDef<AdminTaxiRefundQueueDto>[]>(
    () => [
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatAdminDateTime(row.original.updatedAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.status)}
            tone={statusTone(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'kind',
        header: 'Refund of',
        cell: ({ row }) => (
          <div className="taxi-fleet-cell">
            <span>{KIND_LABELS[row.original.kind] ?? humanizeAdminLabel(row.original.kind)}</span>
            <span className="taxi-fleet-cell__secondary">
              {humanizeAdminLabel(row.original.reason)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'amountPaise',
        header: 'Amount',
        cell: ({ row }) => formatPaise(row.original.amountPaise),
      },
      {
        accessorKey: 'attempts',
        header: 'Attempts',
        cell: ({ row }) => String(row.original.attempts),
      },
      {
        id: 'lastError',
        header: 'Last error',
        accessorFn: (row) => row.lastError ?? '',
        cell: ({ row }) =>
          row.original.lastError ? (
            <span className="taxi-error-text">{row.original.lastError}</span>
          ) : (
            '—'
          ),
      },
      {
        id: 'booking',
        header: 'Booking',
        accessorFn: (row) => row.bookingId,
        cell: ({ row }) => (
          <Link
            className="admin-link admin-mono"
            to={adminTaxiBookingPath(row.original.bookingId)}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {shortAdminId(row.original.bookingId)}
          </Link>
        ),
      },
      {
        id: 'provider',
        header: 'Provider ids',
        accessorFn: (row) => row.providerPaymentId,
        cell: ({ row }) => (
          <div className="taxi-fleet-cell">
            <span className="admin-mono">{row.original.providerPaymentId}</span>
            <span className="taxi-fleet-cell__secondary admin-mono">
              {row.original.providerRefundId ?? 'no refund id'}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canWrite && RETRYABLE.has(row.original.status) ? (
            <AlButton
              size="sm"
              variant="secondary"
              data-testid={`taxi-refund-retry-${row.original.id}`}
              onClick={(event) => {
                event.stopPropagation();
                queue.retry.reset();
                setPending({ row: row.original, key: newIdempotencyKey() });
              }}
            >
              Retry
            </AlButton>
          ) : null,
      },
    ],
    [canWrite, queue.retry],
  );

  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi refunds"
          description="Refunds the provider rejected or that need reconciliation. Retry after the cause is fixed — each retry is audited."
          actions={
            <AlPageHeaderAction
              label={queue.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={queue.isFetching}
              variant="secondary"
              onClick={queue.refresh}
            />
          }
        />
        {queue.notDeployed ? (
          <AdminNotDeployedState title="Taxi refunds" endpoint="GET /admin/v1/taxi/refunds" />
        ) : queue.userErrorMessage && queue.refunds.length === 0 ? (
          <AlErrorState message={queue.userErrorMessage} onRetry={queue.refresh} />
        ) : (
          <AdminDataBlock
            filters={
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={STATUS_FILTERS}
                  value={queue.status}
                  onChange={queue.setStatus}
                  aria-label="Refund status"
                />
              </AdminFilterField>
            }
          >
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="taxi-refunds"
              columns={columns}
              data={queue.refunds}
              loading={queue.isLoading}
              isRefreshing={queue.isFetching && !queue.isFetchingNextPage}
              error={queue.userErrorMessage}
              onRetry={queue.refresh}
              enableGlobalSearch={false}
              emptyTitle={queue.status === 'NEEDS_ACTION' ? 'No refunds need action' : 'No refunds'}
              emptyDescription={
                queue.status === 'NEEDS_ACTION'
                  ? 'Every taxi refund has been accepted by the provider.'
                  : 'Nothing has this status.'
              }
              getRowId={(row) => row.id}
            />
            <AdminLoadMore
              hasMore={queue.hasMore}
              loading={queue.isFetchingNextPage}
              onLoadMore={queue.loadMore}
              testId="taxi-refunds-load-more"
            />
          </AdminDataBlock>
        )}

        <AdminReasonDialog
          open={pending !== null}
          onOpenChange={(next) => {
            if (!next) setPending(null);
          }}
          title="Retry this refund?"
          description="Resubmits the refund to the payment provider. Safe to resend: the same retry key never refunds twice."
          confirmLabel="Retry refund"
          loading={queue.retry.isPending}
          error={queue.retryError}
          testIdPrefix="taxi-refund-retry"
          onConfirm={(reason) => {
            if (!pending || !reason) return;
            queue.retry.mutate(
              { id: pending.row.id, reason, idempotencyKey: pending.key },
              {
                onSuccess: () => {
                  setPending(null);
                },
              },
            );
          }}
        >
          {pending ? (
            <AlText tone="muted">
              {formatPaise(pending.row.amountPaise)} ·{' '}
              {KIND_LABELS[pending.row.kind] ?? pending.row.kind} · attempt{' '}
              {String(pending.row.attempts + 1)}
              {pending.row.lastError ? ` · last error: ${pending.row.lastError}` : ''}
            </AlText>
          ) : null}
        </AdminReasonDialog>
      </AlStack>
    </RequirePermission>
  );
}
