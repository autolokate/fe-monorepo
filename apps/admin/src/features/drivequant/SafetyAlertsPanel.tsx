import type { AdminDqOpsAlertDto } from '@autolokate/api-client';
import { AlButton } from '@autolokate/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { adminSosIncidentPath } from '@/app/routes/admin-paths';
import { dqErrorView } from '@/features/drivequant/dq-errors';
import { DqChip, DqErrorBlock } from '@/features/drivequant/dq-ui';
import {
  formatIst,
  safetyAlertDetail,
  safetyAlertKindStatus,
} from '@/features/drivequant/driving-status';
import {
  useAcknowledgeSafetyAlert,
  useSafetyAlerts,
} from '@/hooks/drivequant/useDriveQuantTelemetry';
import { AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { AdminPanel, shortAdminId } from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './drivequant.css';

type Scope = 'OPEN' | 'ALL';
const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ALL', label: 'All alerts' },
];

function AlertRow({
  alert,
  canAck,
  pending,
  onAck,
}: {
  alert: AdminDqOpsAlertDto;
  canAck: boolean;
  pending: boolean;
  onAck: () => void;
}) {
  const kind = safetyAlertKindStatus(alert.kind);
  const reasons = safetyAlertDetail(alert.detail);
  return (
    <li className="dq-alert" data-testid="safety-alert">
      <div className="dq-alert__main">
        <span title={kind.hint}>
          <DqChip label={kind.label} tone={kind.tone} />
        </span>
        {kind.hint ? <span className="admin-muted">{kind.hint}</span> : null}
        <span className="dq-alert__meta">
          {formatIst(alert.createdAt)} · ref{' '}
          <span className="admin-mono">{shortAdminId(alert.ref)}</span>
          {reasons.length > 0 ? ` · ${reasons.join(' · ')}` : ''}
        </span>
      </div>
      <div className="dq-links">
        {alert.incidentId ? (
          <Link className="admin-link" to={adminSosIncidentPath(alert.incidentId)}>
            Open incident
          </Link>
        ) : null}
        {alert.acknowledgedAt ? (
          <span className="admin-muted">Acknowledged {formatIst(alert.acknowledgedAt)}</span>
        ) : canAck ? (
          <AlButton
            size="sm"
            variant="secondary"
            loading={pending}
            disabled={pending}
            data-testid="safety-alert-ack"
            onClick={onAck}
          >
            Acknowledge
          </AlButton>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Safety alerts: crash events that need an operator — not classifiable (never auto-escalated),
 * confirmed without a vehicle or without a paid plan, vehicle guessed, or unreadable. PII-free (no
 * account, no location); acknowledging removes an alert from the open list.
 */
export function SafetyAlertsPanel() {
  const [scope, setScope] = useState<Scope>('OPEN');
  const alerts = useSafetyAlerts(scope === 'ALL');
  const ack = useAcknowledgeSafetyAlert();
  const canAck = useAdminPermission('sos:write');
  const rows = alerts.data ?? [];
  const ackError = ack.error
    ? dqErrorView(ack.error, 'This alert was already acknowledged.')
    : null;
  return (
    <AdminPanel
      title="Safety alerts"
      subtitle="Crash events that need a person: not classified, not escalated, vehicle guessed or unreadable. Times in IST."
    >
      <div data-testid="safety-alerts">
        <div className="dq-filters">
          <AdminFilterField label="Show">
            <AdminFilterChips
              options={SCOPE_OPTIONS}
              value={scope}
              onChange={setScope}
              aria-label="Alert scope"
            />
          </AdminFilterField>
        </div>
        {alerts.isLoading ? <AdminPageLoader label="Loading safety alerts…" /> : null}
        {alerts.notDeployed ? (
          <p className="admin-muted" data-testid="safety-alerts-unavailable">
            Safety alerts are not available on this server yet.
          </p>
        ) : alerts.error ? (
          <DqErrorBlock error={alerts.error} onRetry={alerts.refetch} />
        ) : alerts.data && rows.length === 0 ? (
          <p className="admin-muted" data-testid="safety-alerts-empty">
            {scope === 'OPEN' ? 'No open safety alerts.' : 'No safety alerts yet.'}
          </p>
        ) : null}
        {ackError ? (
          <p className="admin-inline-alert" role="alert">
            {ackError.message}
          </p>
        ) : null}
        {rows.length > 0 ? (
          <ul className="dq-alerts">
            {rows.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                canAck={canAck}
                pending={ack.isPending && ack.variables === alert.id}
                onAck={() => {
                  ack.mutate(alert.id);
                }}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </AdminPanel>
  );
}
