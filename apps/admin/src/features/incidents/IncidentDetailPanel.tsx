import type { AdminIncidentDetail } from '@autolokate/api-client';
import { AlButton, AlErrorState, AlStack } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';

export type IncidentDetailPanelProps = {
  detail: AdminIncidentDetail | null;
  isLoading: boolean;
  userErrorMessage: string | null;
  onClear: () => void;
};

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function statusTone(status: string): AdminStatusChipTone {
  if (status === 'OPEN') return 'draft';
  if (status === 'RESOLVED') return 'active';
  return 'neutral';
}

/** Read-only break-glass PII view after a consumed detail grant. */
export function IncidentDetailPanel({
  detail,
  isLoading,
  userErrorMessage,
  onClear,
}: IncidentDetailPanelProps) {
  if (userErrorMessage && !detail) {
    return (
      <AlErrorState
        message={`${userErrorMessage} Detail grants are single-use — request a new approval.`}
        onRetry={onClear}
      />
    );
  }

  if (isLoading && !detail) {
    return (
      <AdminPanel title="Incident detail">
        <p className="admin-muted" data-testid="incident-detail-loading">
          Loading incident detail…
        </p>
      </AdminPanel>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <AdminPanel
      title="Incident detail"
      subtitle="Sensitive emergency data — this view is audited."
      meta={
        <AlButton
          size="sm"
          variant="secondary"
          data-testid="incident-detail-clear"
          onClick={onClear}
        >
          Clear detail
        </AlButton>
      }
    >
      <AlStack gap="md" data-testid="incident-detail-panel">
        <div className="admin-status-row">
          <AdminStatusChip
            label={humanizeAdminLabel(detail.status)}
            tone={statusTone(detail.status)}
          />
          <AdminStatusChip label={humanizeAdminLabel(detail.source)} tone="neutral" />
        </div>

        <AdminDetailSection title="Overview">
          <AdminDetailGrid>
            <AdminDetailField
              label="Incident"
              value={
                <span data-testid="incident-detail-id" title={detail.incidentId}>
                  {shortAdminId(detail.incidentId)}
                </span>
              }
              mono
            />
            <AdminDetailField
              label="Status"
              value={
                <span data-testid="incident-detail-status">
                  {humanizeAdminLabel(detail.status)}
                </span>
              }
            />
            <AdminDetailField label="Kind" value={humanizeAdminLabel(detail.source)} />
            <AdminDetailField label="Opened" value={formatWhen(detail.openedAt)} />
            <AdminDetailField label="Window expires" value={formatWhen(detail.windowExpiresAt)} />
            <AdminDetailField
              label="Vehicle"
              value={detail.vehicleId ? shortAdminId(detail.vehicleId) : '—'}
              mono
            />
            <AdminDetailField
              label="QR"
              value={detail.qrCodeId ? shortAdminId(detail.qrCodeId) : '—'}
              mono
            />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Activity">
          <AdminDetailGrid>
            <AdminDetailField
              label="Alerts"
              value={<span data-testid="incident-detail-alerts">{detail.alerts.length}</span>}
            />
            <AdminDetailField
              label="Timeline steps"
              value={<span data-testid="incident-detail-timeline">{detail.timeline.length}</span>}
            />
            <AdminDetailField
              label="Media"
              value={<span data-testid="incident-detail-media">{detail.media.length}</span>}
            />
          </AdminDetailGrid>
        </AdminDetailSection>
      </AlStack>
    </AdminPanel>
  );
}
