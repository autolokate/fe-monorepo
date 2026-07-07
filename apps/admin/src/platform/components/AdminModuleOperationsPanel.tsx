import { AlButton, AlText } from '@autolokate/ui';
import type { ReactNode } from 'react';

export type AdminModuleOperation = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive';
};

export type AdminModuleOperationsPanelProps = {
  title?: string;
  operations: AdminModuleOperation[];
  emptyMessage?: ReactNode;
  trailing?: ReactNode;
};

export function AdminModuleOperationsPanel({
  title = 'Actions',
  operations,
  emptyMessage,
  trailing,
}: AdminModuleOperationsPanelProps) {
  if (operations.length === 0) {
    return emptyMessage ? <div className="admin-action-bar admin-action-bar--notice">{emptyMessage}</div> : null;
  }

  return (
    <section className="admin-action-bar" aria-label={title}>
      <span className="admin-action-bar__label">{title}</span>
      <div className="admin-action-bar__actions">
        {operations.map((operation) => (
          <AlButton
            key={operation.id}
            size="sm"
            variant={operation.variant ?? 'secondary'}
            loading={operation.loading}
            disabled={operation.disabled || operation.loading}
            title={`${operation.title} — ${operation.description}`}
            onClick={operation.onAction}
          >
            {operation.actionLabel}
          </AlButton>
        ))}
      </div>
      {trailing ? <div className="admin-action-bar__trailing">{trailing}</div> : null}
    </section>
  );
}

export function AdminModuleOperationsNotice({ message }: { message: string }) {
  return (
    <div className="admin-action-bar admin-action-bar--notice" role="status">
      <span className="admin-action-bar__label">Actions</span>
      <AlText tone="muted" variant="caption">
        {message}
      </AlText>
    </div>
  );
}
