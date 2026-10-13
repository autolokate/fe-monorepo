import type { AuditEventDto } from '@autolokate/api-client';
import { AlIconButton, AlText } from '@autolokate/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminAuditEventsPath, adminPaths } from '@/app/routes/admin-paths';
import { useRecentAuditEvents } from '@/hooks/audit/useRecentAuditEvents';
import { useActivityReadState } from '@/platform/components/activity-read-state';
import { formatRelativeTime } from '@/platform/components/activity-feed-utils';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { auditTargetLabel, describeAuditEvent } from '@/platform/utils/audit-labels';

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 2.25a4.5 4.5 0 0 0-4.5 4.5v2.44c0 .47-.16.93-.45 1.3L3.2 12.3A1.13 1.13 0 0 0 4.13 14h9.74a1.13 1.13 0 0 0 .93-1.7l-1.35-1.91a2.1 2.1 0 0 1-.45-1.3V6.75A4.5 4.5 0 0 0 9 2.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 14a1.5 1.5 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ActivityListProps = {
  events: AuditEventDto[];
  loading: boolean;
  isUnread: (event: AuditEventDto) => boolean;
  onOpen: (event: AuditEventDto) => void;
  onDismiss: (event: AuditEventDto) => void;
};

function ActivityList({ events, loading, isUnread, onOpen, onDismiss }: ActivityListProps) {
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
        You’re all caught up.
      </AlText>
    );
  }

  return (
    <ul className="admin-activity-panel__list">
      {events.map((event) => {
        const unread = isUnread(event);
        const target = auditTargetLabel(event.targetType);
        return (
          <li key={event.id} className={`admin-activity-panel__item${unread ? ' is-unread' : ''}`}>
            <Link
              className="admin-activity-panel__open al-admin-focus-ring"
              to={adminAuditEventsPath({ action: event.action, eventId: event.id })}
              onClick={() => {
                onOpen(event);
              }}
            >
              <span className="admin-activity-panel__summary">
                {unread ? <span className="admin-activity-panel__dot" aria-label="Unread" /> : null}
                {describeAuditEvent(event)}
              </span>
              <span className="admin-activity-panel__meta">
                {target ? <span className="admin-activity-panel__detail">{target}</span> : null}
                <time
                  className="admin-activity-panel__time"
                  dateTime={event.at}
                  title={new Date(event.at).toLocaleString()}
                >
                  {formatRelativeTime(event.at)}
                </time>
              </span>
            </Link>
            <button
              type="button"
              className="admin-activity-panel__dismiss al-admin-focus-ring"
              aria-label="Dismiss notification"
              title="Dismiss"
              onClick={() => {
                onDismiss(event);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M3 3l6 6M9 3l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminActivityNotification() {
  const canView = useAdminPermission('audit:view');
  const { data: events = [], isLoading } = useRecentAuditEvents();
  const { isUnread, isDismissed, markRead, markAllRead, dismiss } = useActivityReadState();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const visibleEvents = useMemo(
    () => events.filter((event) => !isDismissed(event)),
    [events, isDismissed],
  );
  const unreadCount = visibleEvents.filter(isUnread).length;

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, open]);

  if (!canView) {
    return null;
  }

  return (
    <div ref={rootRef} className="admin-activity-notification">
      <AlIconButton
        icon={<BellIcon />}
        label={
          unreadCount > 0 ? `Recent activity, ${String(unreadCount)} unread` : 'Recent activity'
        }
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
            <div className="admin-activity-panel__actions">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="admin-activity-panel__link al-admin-focus-ring"
                  onClick={() => {
                    markAllRead(visibleEvents);
                  }}
                >
                  Mark all read
                </button>
              ) : null}
              {visibleEvents.length > 0 ? (
                <button
                  type="button"
                  className="admin-activity-panel__link al-admin-focus-ring"
                  onClick={() => {
                    dismiss(visibleEvents.map((event) => event.id));
                  }}
                >
                  Clear all
                </button>
              ) : null}
              <Link
                className="admin-activity-panel__link al-admin-focus-ring"
                to={adminPaths.auditEvents}
                onClick={close}
              >
                See all
              </Link>
            </div>
          </div>
          <div className="admin-activity-panel__body">
            <ActivityList
              events={visibleEvents}
              loading={isLoading}
              isUnread={isUnread}
              onOpen={(event) => {
                markRead(event.id);
                close();
              }}
              onDismiss={(event) => {
                dismiss([event.id]);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
