import type { AuditEventDto } from '@autolokate/api-client';
import { AlStatusBadge, AlText } from '@autolokate/ui';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths.js';
import { formatAuditField } from '@/platform/utils/audit-field.js';

import './dashboard.css';

function actionTone(action: string): 'active' | 'pending' | 'inactive' {
  if (action.includes('APPROVED') || action.includes('PAID') || action.includes('MINTED')) {
    return 'active';
  }
  if (action.includes('REJECTED') || action.includes('SCRAPPED') || action.includes('ERASURE')) {
    return 'inactive';
  }
  return 'pending';
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const deltaMs = Date.now() - date.getTime();
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${String(minutes)}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${String(hours)}h ago`;
  }
  return date.toLocaleDateString();
}

export type DashboardAuditFeedProps = {
  events: AuditEventDto[];
  loading?: boolean;
};

export function DashboardAuditFeed({ events, loading }: DashboardAuditFeedProps) {
  return (
    <aside className="dashboard-audit-feed al-admin-surface" aria-label="Recent audit activity">
      <div className="dashboard-audit-feed__header">
        <h2 className="dashboard-audit-feed__title">Recent activity</h2>
        <Link className="dashboard-audit-feed__link al-admin-focus-ring" to={adminPaths.auditEvents}>
          View all
        </Link>
      </div>

      {loading ? (
        <div className="dashboard-audit-feed__loading">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="dashboard-audit-feed__skeleton" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <AlText tone="muted" variant="caption">
          Admin actions will appear here as they occur.
        </AlText>
      ) : (
        <ul className="dashboard-audit-feed__list">
          {events.slice(0, 8).map((event) => {
            const target = formatAuditField(event.targetType);
            const targetId = formatAuditField(event.targetId);
            const detail =
              targetId !== '—' ? `${target} · ${targetId}` : target !== '—' ? target : 'System';

            return (
              <li key={event.id} className="dashboard-audit-feed__item">
                <AlStatusBadge label={event.action} status={actionTone(event.action)} />
                <span className="dashboard-audit-feed__detail">{detail}</span>
                <time className="dashboard-audit-feed__time" dateTime={event.at} title={new Date(event.at).toLocaleString()}>
                  {formatRelativeTime(event.at)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
