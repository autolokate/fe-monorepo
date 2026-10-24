import type { AdminIncidentDetail } from '@autolokate/api-client';
import { AlButton, AlErrorState, AlStack, AlText } from '@autolokate/ui';

import { AdminDataBlock } from '@/platform/components/AdminDataBlock';

export type IncidentDetailPanelProps = {
  detail: AdminIncidentDetail | null;
  isLoading: boolean;
  userErrorMessage: string | null;
  onClear: () => void;
};

/** Read-only break-glass PII view after a consumed INCIDENT_DETAIL grant. */
export function IncidentDetailPanel({
  detail,
  isLoading,
  userErrorMessage,
  onClear,
}: IncidentDetailPanelProps) {
  if (userErrorMessage && !detail) {
    return (
      <AlErrorState
        message={`${userErrorMessage} Dual-control detail grants are single-use — request a new INCIDENT_DETAIL approval.`}
        onRetry={onClear}
      />
    );
  }

  if (isLoading && !detail) {
    return (
      <AdminDataBlock>
        <p className="admin-muted" data-testid="incident-detail-loading">
          Loading incident detail…
        </p>
      </AdminDataBlock>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <AdminDataBlock>
      <AlStack gap="sm" data-testid="incident-detail-panel">
        <AlText variant="subtitle">Incident detail (break-glass)</AlText>
        <dl className="incident-detail-grid">
          <div>
            <dt>Incident</dt>
            <dd data-testid="incident-detail-id">{detail.incidentId}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd data-testid="incident-detail-status">{detail.status}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{detail.source}</dd>
          </div>
          <div>
            <dt>Opened</dt>
            <dd>{detail.openedAt}</dd>
          </div>
          <div>
            <dt>Window expires</dt>
            <dd>{detail.windowExpiresAt}</dd>
          </div>
          <div>
            <dt>Vehicle</dt>
            <dd>{detail.vehicleId ?? '—'}</dd>
          </div>
          <div>
            <dt>QR</dt>
            <dd>{detail.qrCodeId ?? '—'}</dd>
          </div>
          <div>
            <dt>Alerts</dt>
            <dd data-testid="incident-detail-alerts">{detail.alerts.length}</dd>
          </div>
          <div>
            <dt>Timeline steps</dt>
            <dd data-testid="incident-detail-timeline">{detail.timeline.length}</dd>
          </div>
          <div>
            <dt>Media</dt>
            <dd data-testid="incident-detail-media">{detail.media.length}</dd>
          </div>
        </dl>
        <AlButton size="sm" variant="secondary" data-testid="incident-detail-clear" onClick={onClear}>
          Clear detail
        </AlButton>
      </AlStack>
    </AdminDataBlock>
  );
}
