import type { AdminShipmentSummary } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { MarkShipmentStatusDialog } from '@/features/shipments/MarkShipmentStatusDialog';
import { SHIPMENTS_STATUS_FILTERS } from '@/features/shipments/shipments-filters';
import { useShipmentsColumns } from '@/features/shipments/shipments-columns';
import { useShipments } from '@/hooks/shipments/useShipments';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { useCanUpdateShipments } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

export function ShipmentsPage() {
  const {
    shipments,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useShipments();

  const canUpdate = useCanUpdateShipments();
  const [markTarget, setMarkTarget] = useState<AdminShipmentSummary | null>(null);

  const columns = useShipmentsColumns({ canUpdate, onUpdateStatus: setMarkTarget });

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Track retail shipments and their delivery status.';
    }
    return buildPageSummary([`${shipments.length.toLocaleString()} shipments loaded`]);
  }, [isLoading, shipments.length]);

  if (userErrorMessage && shipments.length === 0) {
    return (
      <RequirePermission permission="shipments:view">
        <AlErrorState
          message={userErrorMessage}
          onRetry={() => {
            refresh();
          }}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="shipments:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Deliveries"
          description={pageDescription}
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={SHIPMENTS_STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Shipment status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="shipments"
            columns={columns}
            data={shipments}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && shipments.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search order #…"
            emptyTitle="No shipments found"
            emptyDescription="Try another status filter."
            getRowId={(row) => row.orderId}
          />
        </AdminDataBlock>

        <MarkShipmentStatusDialog
          shipment={markTarget}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setMarkTarget(null);
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
