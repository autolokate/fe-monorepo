import type { BreakGlassApprovalDto } from '@autolokate/api-client';
import { TriangleAlertIcon } from '@autolokate/icons';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { BreakGlassDualControlPanel } from '@/features/incidents/BreakGlassDualControlPanel';
import { IncidentDetailPanel } from '@/features/incidents/IncidentDetailPanel';
import { INCIDENTS_STATUS_FILTERS } from '@/features/incidents/incidents-filters';
import { useIncidentsColumns } from '@/features/incidents/incidents-columns';
import { useIncidentDetail } from '@/hooks/incidents/useIncidentDetail';
import { useIncidents } from '@/hooks/incidents/useIncidents';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminKpiStrip,
  AdminPanel,
  humanizeAdminLabel,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './incidents.css';

export function IncidentsPage() {
  const [approval, setApproval] = useState<BreakGlassApprovalDto | null>(null);
  const [listApprovalId, setListApprovalId] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<{
    approvalId: string;
    incidentId: string;
  } | null>(null);
  const [preferredDetailIncidentId, setPreferredDetailIncidentId] = useState<string | null>(null);

  const { incidents, isLoading, userErrorMessage, statusFilter, setStatusFilter } =
    useIncidents(listApprovalId);

  const {
    detail,
    isLoading: detailLoading,
    userErrorMessage: detailError,
  } = useIncidentDetail(detailTarget?.incidentId ?? null, detailTarget?.approvalId ?? null);

  const columns = useIncidentsColumns({
    onRequestDetailGrant: (incidentId) => {
      setPreferredDetailIncidentId(incidentId);
    },
  });

  const kpiItems = useMemo(() => {
    if (incidents.length === 0) return [];
    const counts = new Map<string, number>();
    for (const incident of incidents) {
      counts.set(incident.status, (counts.get(incident.status) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([status, count]) => ({
        label: `${humanizeAdminLabel(status)} (this page)`,
        value: String(count),
      }));
  }, [incidents]);

  const clearListGrant = () => {
    setListApprovalId(null);
    setApproval(null);
  };

  const clearDetailGrant = () => {
    setDetailTarget(null);
  };

  if (userErrorMessage && incidents.length === 0 && listApprovalId) {
    return (
      <RequirePermission permission="incidents:view">
        <AlErrorState
          message={`${userErrorMessage} Dual-control grants are single-use — request a new approval.`}
          onRetry={clearListGrant}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="incidents:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Incidents"
          description="Emergency incidents — dual-control approval required before viewing."
          actions={
            listApprovalId || detailTarget ? (
              <AlPageHeaderAction
                label="New dual-control grant"
                variant="secondary"
                onClick={() => {
                  clearListGrant();
                  clearDetailGrant();
                  setPreferredDetailIncidentId(null);
                }}
              />
            ) : undefined
          }
        />

        <AdminPanel>
          <AlStack direction="row" gap="sm" align="center">
            <TriangleAlertIcon size={16} aria-hidden />
            <AlText variant="caption" tone="muted">
              This console can expose emergency-incident personal data across accounts. Every view
              is audited. Approvals are consumed once when you load the list or a detail.
            </AlText>
          </AlStack>
        </AdminPanel>

        <BreakGlassDualControlPanel
          approval={approval}
          onApprovalChange={setApproval}
          preferredDetailIncidentId={preferredDetailIncidentId}
          onUseListApproval={(id) => {
            setDetailTarget(null);
            setListApprovalId(id);
          }}
          onUseDetailApproval={(approvalId, incidentId) => {
            setListApprovalId(null);
            setDetailTarget({ approvalId, incidentId });
          }}
        />

        {detailTarget ? (
          <IncidentDetailPanel
            detail={detail}
            isLoading={detailLoading}
            userErrorMessage={detailError}
            onClear={clearDetailGrant}
          />
        ) : null}

        {!listApprovalId ? (
          <AdminPanel title="Incident list">
            <AlText variant="body" tone="muted">
              The list stays empty until you load an approved list-access grant. For a single
              incident, request detail access, get peer approval, then Load detail.
            </AlText>
          </AdminPanel>
        ) : (
          <>
            {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}
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
                error={userErrorMessage && incidents.length > 0 ? userErrorMessage : null}
                onRetry={clearListGrant}
                globalSearchPlaceholder="Search incident…"
                emptyTitle="No incidents found"
                emptyDescription="Try another status filter."
                getRowId={(row) => row.incidentId}
              />
            </AdminDataBlock>
          </>
        )}
      </AlStack>
    </RequirePermission>
  );
}
