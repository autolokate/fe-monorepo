import { AlButton, AlDataTable, AlErrorState, AlText } from '@autolokate/ui';
import { useRef, useState } from 'react';

import { useBatchCodeColumns } from '@/features/qr-batches/batch-code-columns';
import {
  BATCH_CODE_STATUS_FILTERS,
  type BatchCodeStatusFilter,
} from '@/features/qr-batches/batch-code-filters';
import { useQrBatchCodes } from '@/hooks/qr-batches/useQrBatchCodes';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminDetailSection } from '@/platform/components/AdminDetailField';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { downloadQrBatchCodesCsv } from '@/services/qr-batches/qr-batch-codes-export-service';

export type BatchCodesSectionProps = {
  batchId: string;
  /** False until codes exist (DRAFT with generatedCount 0). */
  enabled: boolean;
};

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function BatchCodesSection({ batchId, enabled }: BatchCodesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<BatchCodeStatusFilter>('ALL');
  const [exporting, setExporting] = useState(false);
  const exportAbortRef = useRef<AbortController | null>(null);
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

  const onExport = async () => {
    if (exporting) {
      return;
    }
    exportAbortRef.current?.abort();
    const controller = new AbortController();
    exportAbortRef.current = controller;
    setExporting(true);
    try {
      const { blob, filename } = await downloadQrBatchCodesCsv(batchId, controller.signal);
      triggerBrowserDownload(blob, filename);
      showSuccessToast(`Downloaded ${filename}`);
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return;
      }
      reportAdminApiError(error, { context: 'qr-batch-codes:export', toast: true });
    } finally {
      setExporting(false);
    }
  };

  if (!enabled) {
    return (
      <AdminDetailSection
        title="Codes in batch"
        description="Opaque sticker codes appear after generate."
      >
        <AlText tone="muted">Generate codes to list stickers in this batch.</AlText>
      </AdminDetailSection>
    );
  }

  return (
    <AdminDetailSection
      title="Codes in batch"
      description="Opaque sticker ids for this batch (newest first)."
    >
      <div className="admin-sheet-actions">
        <AlButton
          size="sm"
          variant="secondary"
          loading={exporting}
          disabled={exporting}
          onClick={() => {
            void onExport();
          }}
        >
          Export for print
        </AlButton>
      </div>
      <AdminFilterChips
        options={BATCH_CODE_STATUS_FILTERS}
        value={statusFilter}
        onChange={setStatusFilter}
        aria-label="Code status"
      />
      {userErrorMessage && codes.length === 0 && !isLoading ? (
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
            pageSizeOptions={[10, 20, 50]}
            globalSearchPlaceholder="Search loaded codes…"
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
      )}
    </AdminDetailSection>
  );
}
