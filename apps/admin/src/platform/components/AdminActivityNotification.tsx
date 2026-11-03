import type { AuditEventDto } from '@autolokate/api-client';
import { AlText } from '@autolokate/ui';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { useRecentAuditEvents } from '@/hooks/audit/useRecentAuditEvents';
import {
  formatActivityDetail,
  formatRelativeTime,
} from '@/platform/components/activity-feed-utils';
import { AuditActionBadge } from '@/platform/components/EntityStatusBadge';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

function ActivityList({ events, loading }: { events: AuditEventDto[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="admin-activity-panel__loading">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="admin-activity-panel__skeleton" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <AlText tone="muted" variant="caption">
        No recent admin activity yet.
      </AlText>
    );
  }

  return (
    <ul className="admin-activity-panel__list">
      {events.map((event) => (
        <li key={event.id} className="admin-activity-panel__item">
          <AuditActionBadge action={event.action} />
          <span className="admin-activity-panel__detail">
            {formatActivityDetail(event.targetType, event.targetId)}
          </span>
          <time
            className="admin-activity-panel__time"
            dateTime={event.at}
            title={formatAdminDateTime(event.at)}
          >
            {formatRelativeTime(event.at)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export function AdminActivityNotification() {
  const canView = useAdminPermission('audit:view');
  const [open, setOpen] = useState(false);
  // Read only when the panel opens: each read writes an AUDIT_EXPORTED row on the server.
  const { data: events = [], isLoading } = useRecentAuditEvents(open);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, open]);

  if (!canView) {
    return null;
  }

  return (
    <div ref={rootRef} className="admin-activity-notification">
      <button
        type="button"
        className={`ax-icon-btn admin-activity-notification__trigger${open ? ' is-open' : ''}`}
        aria-label="Recent activity"
        title="Recent activity"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        <Bell size={17} aria-hidden />
      </button>

      {open ? (
        <div className="admin-activity-panel" role="dialog" aria-label="Recent activity">
          <div className="admin-activity-panel__header">
            <h2 className="admin-activity-panel__title">Recent activity</h2>
            <Link
              className="admin-activity-panel__link al-admin-focus-ring"
              to={adminPaths.auditEvents}
              onClick={close}
            >
              See all
            </Link>
          </div>
          <ActivityList events={events} loading={isLoading} />
        </div>
      ) : null}
    </div>
  );
}
