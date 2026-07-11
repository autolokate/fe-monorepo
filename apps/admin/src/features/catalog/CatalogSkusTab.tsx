import type { AdminPlanDto, SkuSummaryDto } from '@autolokate/api-client';
import { AlDataTable, AlStack, AlText } from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import {
  SKU_ACTIVITY_FILTERS,
  SKU_CHANNEL_FILTERS,
  type SkuActivityFilter,
} from '@/features/catalog/catalog-filters';
import { EditSkuSheet } from '@/features/catalog/EditSkuSheet';
import { useSkuColumns } from '@/features/catalog/sku-columns';
import type { SkuChannelFilter } from '@/hooks/catalog/useCatalogSkus';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { indexPlansById } from '@/services/catalog/catalog-model';

export type CatalogSkusTabProps = {
  skus: SkuSummaryDto[];
  plans: AdminPlanDto[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  channelFilter: SkuChannelFilter;
  onChannelFilterChange: (filter: SkuChannelFilter) => void;
  includeInactive: boolean;
  onIncludeInactiveChange: (includeInactive: boolean) => void;
  canWrite: boolean;
};

export function CatalogSkusTab({
  skus,
  plans,
  isLoading,
  isFetching,
  errorMessage,
  onRetry,
  channelFilter,
  onChannelFilterChange,
  includeInactive,
  onIncludeInactiveChange,
  canWrite,
}: CatalogSkusTabProps) {
  const plansById = useMemo(() => indexPlansById(plans), [plans]);
  const columns = useSkuColumns(plansById);

  const [selectedSku, setSelectedSku] = useState<SkuSummaryDto | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const openSku = useCallback((sku: SkuSummaryDto) => {
    setSelectedSku(sku);
    setEditOpen(true);
  }, []);

  const activityFilter: SkuActivityFilter = includeInactive ? 'ALL' : 'ACTIVE_ONLY';

  const emptyShelfCount = useMemo(
    () => skus.filter((sku) => sku.offeredTiers.length === 0).length,
    [skus],
  );

  return (
    <AlStack gap="md">
      <AlText variant="caption" tone="muted">
        A SKU&apos;s shelf (`offeredTiers`) is a server-enforced money control, not a display hint: a tier
        that is not on the shelf cannot be sold against that SKU&apos;s stock, and an empty shelf sells
        nothing. The SKU&apos;s default plan must itself be on that shelf. &quot;Accepting new batches&quot;
        controls manufacturing only — closing it does not stop stickers already printed from selling.
      </AlText>

      {emptyShelfCount > 0 ? (
        <AlText role="alert">
          {emptyShelfCount === 1
            ? '1 SKU has an empty shelf and can sell nothing.'
            : `${String(emptyShelfCount)} SKUs have an empty shelf and can sell nothing.`}
        </AlText>
      ) : null}

      <AdminDataBlock
        filters={
          <>
            <AdminFilterField label="Channel">
              <AdminFilterChips
                options={SKU_CHANNEL_FILTERS}
                value={channelFilter}
                onChange={onChannelFilterChange}
                aria-label="SKU channel"
              />
            </AdminFilterField>
            <AdminFilterField label="Manufacturing">
              <AdminFilterChips
                options={SKU_ACTIVITY_FILTERS}
                value={activityFilter}
                onChange={(next) => {
                  onIncludeInactiveChange(next === 'ALL');
                }}
                aria-label="SKU manufacturing status"
              />
            </AdminFilterField>
          </>
        }
      >
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId="catalog-skus"
          columns={columns}
          data={skus}
          loading={isLoading}
          isRefreshing={isFetching}
          error={errorMessage}
          onRetry={onRetry}
          globalSearchPlaceholder="Search SKU code…"
          emptyTitle="No SKUs found"
          emptyDescription="Create a SKU or try another filter."
          getRowId={(row) => row.id}
          onRowClick={openSku}
        />
      </AdminDataBlock>

      <EditSkuSheet
        sku={selectedSku}
        open={editOpen}
        onOpenChange={setEditOpen}
        plans={plans}
        canWrite={canWrite}
      />
    </AlStack>
  );
}
