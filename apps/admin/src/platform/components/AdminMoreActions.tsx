import type { ReactNode } from 'react';

export type AdminMoreAction = {
  id: string;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export type AdminMoreActionsProps = {
  actions: AdminMoreAction[];
  label?: string;
  trailing?: ReactNode;
};

export function AdminMoreActions({ actions, label = 'More actions', trailing }: AdminMoreActionsProps) {
  if (actions.length === 0) {
    return trailing ? <>{trailing}</> : null;
  }

  return (
    <div className="admin-more-actions">
      <details className="admin-more-actions__details">
        <summary className="admin-more-actions__summary al-admin-focus-ring">More</summary>
        <div className="admin-more-actions__menu" role="menu" aria-label={label}>
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className="admin-more-actions__item al-admin-focus-ring"
              disabled={action.disabled || action.loading}
              onClick={action.onClick}
            >
              {action.loading ? `${action.label}…` : action.label}
            </button>
          ))}
        </div>
      </details>
      {trailing}
    </div>
  );
}
