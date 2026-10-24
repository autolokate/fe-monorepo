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
import { buildPageSummary } from '@/platform/components/build-page-summary';
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

  const clearListGrant = () => {
    setListApprovalId(null);
    setApproval(null);
  };

  const clearDetailGrant = () => {
    setDetailTarget(null);
  };

  const pageDescription = useMemo(() => {
    if (!listApprovalId && !detailTarget) {
      return 'Dual-control approval required before any incident PII is loaded.';
    }
    if (detailTarget && detailLoading) {
      return 'Loading break-glass incident detail…';
    }
    if (detailTarget && detail) {
      return `Detail loaded for ${detail.incidentId}`;
    }
    if (listApprovalId && isLoading) {
      return 'Emergency incidents across every account (break-glass, read-only).';
    }
    if (listApprovalId) {
      return buildPageSummary([`${incidents.length.toLocaleString()} incidents loaded`]);
    }
    return 'Dual-control approval required before any incident PII is loaded.';
  }, [listApprovalId, detailTarget, detailLoading, detail, isLoading, incidents.length]);

  const breakGlassNotice = (
    <AlStack direction="row" gap="sm" align="center">
      <TriangleAlertIcon size={16} aria-hidden />
      <AlText variant="caption" tone="muted">
        Break-glass — this console exposes emergency-incident PII across all accounts. Every view
        (list and detail) is audited. Dual-control approval is consumed once per call.
      </AlText>
    </AlStack>
  );

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
          description={pageDescription}
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

        {breakGlassNotice}

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
          <AlText variant="body" tone="muted">
            Incident list stays empty until the requester loads an APPROVED INCIDENT_LIST grant.
            For a single incident, request INCIDENT_DETAIL, get peer approval, then Load detail.
          </AlText>
        ) : (
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
        )}
      </AlStack>
    </RequirePermission>
  );
}
