import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './Badge.css';

export type AlBadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type AlBadgeProps = {
  children: ReactNode;
  variant?: AlBadgeVariant;
  className?: string;
};

export function AlBadge({ children, variant = 'neutral', className }: AlBadgeProps) {
  return <span className={cn('al-badge', `al-badge--${variant}`, className)}>{children}</span>;
}

export type AlStatusBadgeProps = {
  label: string;
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'info';
};

const STATUS_VARIANT: Record<AlStatusBadgeProps['status'], AlBadgeVariant> = {
  active: 'success',
  success: 'success',
  inactive: 'neutral',
  pending: 'warning',
  error: 'danger',
  info: 'info',
};

const STATUS_DOT: Record<AlStatusBadgeProps['status'], string> = {
  active: 'success',
  success: 'success',
  inactive: 'neutral',
  pending: 'warning',
  error: 'danger',
  info: 'info',
};

export function AlStatusBadge({ label, status }: AlStatusBadgeProps) {
  return (
    <span className={cn('al-status-badge', 'al-badge', `al-badge--${STATUS_VARIANT[status]}`)}>
      <span
        className={cn('al-status-badge__dot', `al-status-badge__dot--${STATUS_DOT[status]}`)}
        aria-hidden
      />
      {label}
    </span>
  );
}
