import type { AdminPromoDto } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { CreatePromoSheet } from '@/features/promos/CreatePromoSheet.js';
import { PromoDetailSheet } from '@/features/promos/PromoDetailSheet.js';
import { PROMO_STATUS_FILTERS } from '@/features/promos/promo-filters.js';
import { usePromoColumns } from '@/features/promos/promo-columns.js';
import { usePromoManagement } from '@/hooks/promos/usePromoManagement.js';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock.js';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips.js';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props.js';
import { buildPageSummary } from '@/platform/components/build-page-summary.js';
import { useCanWritePromoMutations } from '@/platform/rbac/module-write-permissions.js';
import { RequirePermission } from '@/platform/rbac/RequirePermission.js';

import './promos.css';

export function PromoManagementPage() {
  const {
    promos,
    metrics,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    refresh,
    data,
  } = usePromoManagement();

  const canWrite = useCanWritePromoMutations();
  const [selectedPromo, setSelectedPromo] = useState<AdminPromoDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const openPromo = useCallback((promo: AdminPromoDto) => {
    setSelectedPromo(promo);
    setDetailOpen(true);
  }, []);

  const columns = usePromoColumns();

  const handlePromoCreated = useCallback(
    (promo: AdminPromoDto) => {
      openPromo(promo);
    },
    [openPromo],
  );

  const pageDescription = useMemo(() => {
    if (isLoading || !metrics) {
      return 'Create and manage promotional campaigns.';
    }
    return buildPageSummary([
      `${metrics.totalPromos.toLocaleString()} promos`,
      `${metrics.activePromos.toLocaleString()} active`,
      `${metrics.upcomingPromos.toLocaleString()} upcoming`,
    ]);
  }, [isLoading, metrics]);

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="promo:view">
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
    <RequirePermission permission="promo:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Promo Management"
          description={pageDescription}
          actions={
            <>
              {canWrite ? (
                <AlPageHeaderAction
                  label="Create promo"
                  onClick={() => {
                    setCreateOpen(true);
                  }}
                />
              ) : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
            </>
          }
        />

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={PROMO_STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Promo status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="promos"
            columns={columns}
            data={promos}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search promo code…"
            emptyTitle="No promos found"
            emptyDescription="Create a promo or try another status filter."
            getRowId={(row) => row.id}
            onRowClick={openPromo}
          />
        </AdminDataBlock>

        <CreatePromoSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handlePromoCreated}
        />

        <PromoDetailSheet
          promo={selectedPromo}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          canWrite={canWrite}
          onCreatePromo={
            canWrite
              ? () => {
                  setCreateOpen(true);
                }
              : undefined
          }
        />
      </AlStack>
    </RequirePermission>
  );
}
