import { AlButton, AlDataTable, AlErrorState, AlSectionHeader, AlText } from '@autolokate/ui';
import { useState } from 'react';

import { useBatchCodeColumns } from '@/features/qr-batches/batch-code-columns';
import {
  BATCH_CODE_STATUS_FILTERS,
  type BatchCodeStatusFilter,
} from '@/features/qr-batches/batch-code-filters';
import { useQrBatchCodes } from '@/hooks/qr-batches/useQrBatchCodes';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminDetailSection } from '@/platform/components/AdminDetailField';

export type BatchCodesSectionProps = {
  batchId: string;
  /** False until codes exist (DRAFT with generatedCount 0). */
  enabled: boolean;
  /** Full-width table layout for batch detail page. */
  layout?: 'section' | 'page';
};

export function BatchCodesSection({
  batchId,
  enabled,
  layout = 'section',
}: BatchCodesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<BatchCodeStatusFilter>('ALL');
  const columns = useBatchCodeColumns();

  const {
    codes,
    hasMore,
    isLoading,
    isFetching,
    isFetchingNextPage,
    userErrorMessage,
    refresh,
    loadOlder,
  } = useQrBatchCodes(batchId, statusFilter, enabled);

  const statusFilters = (
    <AdminFilterChips
      options={BATCH_CODE_STATUS_FILTERS}
      value={statusFilter}
      onChange={setStatusFilter}
      aria-label="Code status"
    />
  );

  const codesTable =
    userErrorMessage && codes.length === 0 && !isLoading ? (
      <AlErrorState
        message={userErrorMessage}
        onRetry={() => {
          refresh();
        }}
      />
    ) : (
      <>
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId={`qr-batch-codes-${batchId}`}
          columns={columns}
          data={codes}
          loading={isLoading}
          isRefreshing={isFetching && !isFetchingNextPage}
          error={userErrorMessage && codes.length > 0 ? userErrorMessage : null}
          onRetry={refresh}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          globalSearchPlaceholder="Search codes…"
          emptyTitle="No codes found"
          emptyDescription={
            statusFilter === 'ALL'
              ? 'This batch has no codes yet.'
              : 'No codes match this status filter.'
          }
          getRowId={(row) => row.id}
          enableRowSelection={false}
        />
        {hasMore ? (
          <div className="qr-batch-codes-load-more">
            <AlButton
              size="sm"
              variant="secondary"
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              onClick={loadOlder}
            >
              Load older codes
            </AlButton>
          </div>
        ) : null}
      </>
    );

  if (!enabled) {
    if (layout === 'page') {
      return (
        <section className="qr-batch-codes-page">
          <AlSectionHeader
            title="Codes in batch"
            description="Opaque sticker codes appear after generate."
          />
          <AlText tone="muted" className="admin-empty-note">
            Generate codes to list stickers in this batch.
          </AlText>
        </section>
      );
    }

    return (
      <AdminDetailSection
        title="Codes in batch"
        description="Opaque sticker codes appear after generate."
      >
        <AlText tone="muted" className="admin-empty-note">
          Generate codes to list stickers in this batch.
        </AlText>
      </AdminDetailSection>
    );
  }

  if (layout === 'page') {
    return (
      <section className="qr-batch-codes-page">
        <AlSectionHeader
          title="Codes in batch"
          description="Opaque sticker ids for this batch (newest first). Print-house CSV export is unavailable."
        />
        <AdminDataBlock
          filters={<AdminFilterField label="Status">{statusFilters}</AdminFilterField>}
        >
          {codesTable}
        </AdminDataBlock>
      </section>
    );
  }

  return (
    <AdminDetailSection
      title="Codes in batch"
      description="Opaque sticker ids for this batch (newest first). Print-house CSV export is unavailable."
    >
      {statusFilters}
      {codesTable}
    </AdminDetailSection>
  );
}
