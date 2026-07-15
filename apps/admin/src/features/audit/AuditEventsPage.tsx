import type { AuditEventDto } from '@autolokate/api-client';
import {
  AlBadge,
  AlButton,
  AlDataTable,
  AlErrorState,
  AlInput,
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
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './audit-events.css';

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

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Search and review administrative actions.';
    }
    const parts = [`${events.length.toLocaleString()} events loaded`];
    if (filtersActive) {
      parts.push('filters active');
    }
    return buildPageSummary(parts);
  }, [events.length, filtersActive, isLoading]);

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
          title="Audit Events"
          description={pageDescription}
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching && !isFetchingNextPage}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

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
                <AlInput
                  value={filters.targetType}
                  placeholder="e.g. batch, promo"
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, targetType: event.target.value }));
                  }}
                />
              </AdminFilterField>
              <div className="audit-filters-inline__actions">
                <AlButton size="sm" onClick={applyFilters}>
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
                    <AlInput
                      value={filters.targetId}
                      placeholder="Filter by entity"
                      mono
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, targetId: event.target.value }));
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="From">
                    <AlInput
                      type="datetime-local"
                      value={filters.from}
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, from: event.target.value }));
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="To">
                    <AlInput
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
            emptyTitle="No audit events found"
            emptyDescription="Adjust filters or refresh the audit log."
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
