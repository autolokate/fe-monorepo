import type { AuditEventDto } from '@autolokate/api-client';
import { AlIconButton, AlText } from '@autolokate/ui';
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

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 2.25a4.5 4.5 0 0 0-4.5 4.5v2.44c0 .47-.16.93-.45 1.3L3.2 12.3A1.13 1.13 0 0 0 4.13 14h9.74a1.13 1.13 0 0 0 .93-1.7l-1.35-1.91a2.1 2.1 0 0 1-.45-1.3V6.75A4.5 4.5 0 0 0 9 2.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

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
            title={new Date(event.at).toLocaleString()}
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
  const { data: events = [], isLoading } = useRecentAuditEvents();
  const [open, setOpen] = useState(false);
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

  const unreadCount = events.length;

  return (
    <div ref={rootRef} className="admin-activity-notification">
      <AlIconButton
        icon={<BellIcon />}
        label="Recent activity"
        size="sm"
        className={`admin-activity-notification__trigger al-admin-focus-ring${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
      />
      {unreadCount > 0 ? (
        <span className="admin-activity-notification__badge" aria-hidden>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}

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
