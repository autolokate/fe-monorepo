import type { AdminTaxiBookingSummaryDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminTaxiBookingPath } from '@/app/routes/admin-paths';
import {
  TAXI_BOOKING_STATUS_FILTERS,
  customerAdvanceOf,
  formatMoneySide,
  partnerDepositOf,
} from '@/features/taxi/taxi-ops-format';
import { useTaxiBookings } from '@/hooks/taxi/useTaxiOperations';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import {
  formatAdminDateTime,
  formatRupeeAmount,
  shortAdminId,
} from '@/platform/utils/format-admin-date';

import './taxi-policy.css';

function useBookingColumns(): ColumnDef<AdminTaxiBookingSummaryDto>[] {
  return useMemo(
    () => [
      {
        id: 'booking',
        header: 'Booking',
        accessorFn: (row) => row.id,
        cell: ({ row }) => <span className="admin-mono">{shortAdminId(row.original.id)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className="admin-status-chip admin-status-chip--neutral">
            {humanizeAdminLabel(row.original.status)}
          </span>
        ),
      },
      {
        id: 'route',
        header: 'Route',
        accessorFn: (row) => `${row.pickupLabel ?? '—'} → ${row.dropoffLabel ?? '—'}`,
      },
      {
        id: 'pickupAt',
        header: 'Pickup',
        accessorFn: (row) => formatAdminDateTime(row.pickupAt),
      },
      {
        id: 'fare',
        header: 'Fare',
        accessorFn: (row) => formatRupeeAmount(row.selectedFareRupees),
      },
      {
        id: 'advance',
        header: 'Customer advance',
        accessorFn: (row) => formatMoneySide(customerAdvanceOf(row)),
      },
      {
        id: 'deposit',
        header: 'Partner deposit',
        accessorFn: (row) => formatMoneySide(partnerDepositOf(row)),
      },
      {
        id: 'partner',
        header: 'Partner',
        accessorFn: (row) => shortAdminId(row.orgId),
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessorFn: (row) => formatAdminDateTime(row.createdAt),
      },
    ],
    [],
  );
}

export function TaxiBookingsPage() {
  const navigate = useNavigate();
  const columns = useBookingColumns();
  const {
    bookings,
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
  } = useTaxiBookings();

  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi bookings"
          description="Every booking after a customer selected a bid — money state from the server, checkouts and refunds in the detail."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />
        {notDeployed ? (
          <AdminNotDeployedState title="Taxi bookings" endpoint="GET /admin/v1/taxi/bookings" />
        ) : userErrorMessage && !data ? (
          <AlErrorState message={userErrorMessage} onRetry={refresh} />
        ) : (
          <>
            <AdminDataBlock
              filters={
                <AdminFilterField label="Status">
                  <AdminFilterChips
                    options={TAXI_BOOKING_STATUS_FILTERS}
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                    }}
                    aria-label="Booking status"
                  />
                </AdminFilterField>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="taxi-bookings"
                columns={columns}
                data={bookings}
                loading={isLoading}
                isRefreshing={isFetching && !isFetchingNextPage}
                error={userErrorMessage}
                onRetry={refresh}
                enableGlobalSearch={false}
                emptyTitle="No bookings"
                emptyDescription={
                  status === 'ALL'
                    ? 'No taxi booking has been created yet.'
                    : 'No booking has this status. Try another filter.'
                }
                getRowId={(row) => row.id}
                onRowClick={(row) => {
                  void navigate(adminTaxiBookingPath(row.id));
                }}
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
      </AlStack>
    </RequirePermission>
  );
}
