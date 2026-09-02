import { TriangleAlertIcon } from '@autolokate/icons';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useMemo } from 'react';

import { INCIDENTS_STATUS_FILTERS } from '@/features/incidents/incidents-filters';
import { useIncidentsColumns } from '@/features/incidents/incidents-columns';
import { useIncidents } from '@/hooks/incidents/useIncidents';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

export function IncidentsPage() {
  const {
    incidents,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useIncidents();

  const columns = useIncidentsColumns();

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Emergency incidents across every account (break-glass, read-only).';
    }
    return buildPageSummary([`${incidents.length.toLocaleString()} incidents loaded`]);
  }, [isLoading, incidents.length]);

  const breakGlassNotice = (
    <AlStack direction="row" gap="sm" align="center">
      <TriangleAlertIcon size={16} aria-hidden />
      <AlText variant="caption" tone="muted">
        Break-glass — this console exposes emergency-incident PII across all accounts. Every view
        (list and detail) is audited.
      </AlText>
    </AlStack>
  );

  if (userErrorMessage && incidents.length === 0) {
    return (
      <RequirePermission permission="incidents:view">
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
    <RequirePermission permission="incidents:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Incidents"
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

        {breakGlassNotice}

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={INCIDENTS_STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Incident status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="incidents"
            columns={columns}
            data={incidents}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && incidents.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search incident…"
            emptyTitle="No incidents found"
            emptyDescription="Try another status filter."
            getRowId={(row) => row.incidentId}
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
