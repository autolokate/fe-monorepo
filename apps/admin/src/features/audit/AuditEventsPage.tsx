import type { AuditEventDto } from '@autolokate/api-client';
import {
  AlBadge,
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { AuditActionFilter } from '@/features/audit/AuditActionFilter';
import { AuditDetailSheet } from '@/features/audit/AuditDetailSheet';
import {
  AUDIT_PAGE_SIZE_OPTIONS,
  DEFAULT_AUDIT_EXPLORER_FILTERS,
  hasActiveAuditFilters,
  resolveActionFilter,
  type AuditExplorerFilters,
} from '@/features/audit/audit-filters';
import { useAuditColumns } from '@/features/audit/audit-columns';
import { useAuditExplorer } from '@/hooks/audit/useAuditExplorer';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminKpiStrip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './audit-events.css';

function actionCountsFromPage(events: AuditEventDto[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.action, (counts.get(event.action) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([action, count]) => ({
      label: `${humanizeAdminLabel(action)} (loaded)`,
      value: String(count),
    }));
}

export function AuditEventsPage() {
  const [filters, setFilters] = useState<AuditExplorerFilters>(DEFAULT_AUDIT_EXPLORER_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AuditExplorerFilters>(
    DEFAULT_AUDIT_EXPLORER_FILTERS,
  );
  const [filterError, setFilterError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    events,
    hasMore,
    isLoading,
    isFetching,
    isFetchingNextPage,
    userErrorMessage,
    refresh,
    loadOlder,
  } = useAuditExplorer(appliedFilters);

  const [selectedEvent, setSelectedEvent] = useState<AuditEventDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openEvent = useCallback((event: AuditEventDto) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  }, []);

  const columns = useAuditColumns();
  const kpiItems = useMemo(() => (events.length > 0 ? actionCountsFromPage(events) : []), [events]);

  const applyFilters = useCallback(() => {
    if (filters.action.trim() && !resolveActionFilter(filters.action)) {
      setFilterError('Pick a valid action from the list.');
      return;
    }
    setFilterError(null);
    setAppliedFilters({ ...filters });
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_AUDIT_EXPLORER_FILTERS);
    setAppliedFilters(DEFAULT_AUDIT_EXPLORER_FILTERS);
    setFilterError(null);
    setShowAdvancedFilters(false);
  }, []);

  const filtersActive = hasActiveAuditFilters(appliedFilters);

  if (userErrorMessage && events.length === 0 && !isLoading) {
    return (
      <RequirePermission permission="audit:view">
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
    <RequirePermission permission="audit:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Activity Log"
          description="Search and review administrative actions."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching && !isFetchingNextPage}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <>
              <AdminFilterField label="Action">
                <AuditActionFilter
                  compact
                  value={filters.action}
                  onChange={(action) => {
                    setFilters((current) => ({ ...current, action }));
                    setFilterError(null);
                  }}
                  errorText={filterError}
                />
              </AdminFilterField>
              <AdminFilterField label="Target type">
                <input
                  data-testid="audit-filter-target-type"
                  value={filters.targetType}
                  placeholder="e.g. batch, promo"
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, targetType: event.target.value }));
                  }}
                />
              </AdminFilterField>
              <div className="audit-filters-inline__actions">
                <AlButton size="sm" data-testid="audit-filter-apply" onClick={applyFilters}>
                  Apply
                </AlButton>
                {filtersActive ? (
                  <AlButton size="sm" variant="secondary" onClick={clearFilters}>
                    Clear
                  </AlButton>
                ) : null}
                <AlButton
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAdvancedFilters((value) => !value);
                  }}
                >
                  {showAdvancedFilters ? 'Less' : 'More'}
                </AlButton>
                {filtersActive ? <AlBadge variant="info">Filtered</AlBadge> : null}
              </div>
              {showAdvancedFilters ? (
                <div className="audit-filters-advanced">
                  <AdminFilterField label="Entity reference">
                    <input
                      value={filters.targetId}
                      placeholder="Filter by entity"
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, targetId: event.target.value }));
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="From">
                    <input
                      type="datetime-local"
                      value={filters.from}
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, from: event.target.value }));
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="To">
                    <input
                      type="datetime-local"
                      value={filters.to}
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, to: event.target.value }));
                      }}
                    />
                  </AdminFilterField>
                </div>
              ) : null}
            </>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="audit-events"
            columns={columns}
            data={events}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && events.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            pageSize={appliedFilters.limit}
            pageSizeOptions={[...AUDIT_PAGE_SIZE_OPTIONS]}
            globalSearchPlaceholder="Search loaded events…"
            emptyTitle="No activity found"
            emptyDescription="Adjust filters or refresh."
            getRowId={(row) => row.id}
            onRowClick={openEvent}
          />
        </AdminDataBlock>

        {hasMore ? (
          <div className="audit-load-more">
            <AlButton
              variant="secondary"
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              onClick={loadOlder}
            >
              Load older events
            </AlButton>
          </div>
        ) : null}

        <AuditDetailSheet event={selectedEvent} open={detailOpen} onOpenChange={setDetailOpen} />
      </AlStack>
    </RequirePermission>
  );
}
